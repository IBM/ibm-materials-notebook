import Big from "big.js";
import { convertQty } from "cmdl-units";
import { CMDL } from "cmdl-types";
import { ReactorComponent } from "./reactor-component";
import { ReactorChemicals } from "./reactor-chemicals";
import {
  ReactorGroupOutput,
  SerializedReactorGroup,
} from "./reactor-container";

/**
 * Interface for node in a reactor graph
 */
export interface ReactorNode {
  name: string;
  parent: ReactorNode | null;
  volume: CMDL.BigQty | null;
  setParent(arg: ReactorNode): void;
  getInputs(): ReactorChemicals | ReactorChemicals[];
}

/**
 * Class representing a reactor group within a CMDL continuous-flow reactor representation
 */
export class Reactor implements ReactorNode {
  volume: CMDL.BigQty | null = null;
  flowRate: CMDL.BigQty | null = null;
  residenceTime: CMDL.BigQty | null = null;
  reactorOutput: CMDL.ChemicalOutput[] = [];
  outputNode: ReactorComponent | null = null;
  parent: ReactorNode | null = null;
  children: ReactorNode[] = [];

  constructor(public name: string) {}

  /**
   * Sets output node of the reactor group.
   * A reactor group should have only one output node
   */
  public setOutputNode(): void {
    for (const child of this.children) {
      if (
        child instanceof ReactorComponent &&
        (!child.next || child.next.parent !== this)
      ) {
        this.outputNode = child;
      }
    }
  }

  /**
   * Adds a child component to the reactor group
   * @param child ReactorNode
   */
  public add(child: ReactorNode): void {
    child.setParent(this);
    this.children.push(child);
  }

  /**
   * Sets the parent of the reactor group
   * @param arg ReactorNode
   */
  public setParent(arg: ReactorNode): void {
    this.parent = arg;
  }

  /**
   * Computes the total volume of the reactor group
   * @returns undefined
   */
  public computeVolume(): void {
    let volume = Big(0);

    for (const child of this.children) {
      if (child.volume) {
        volume = volume.plus(child.volume.value);
      }
    }

    if (volume.toNumber() === 0) {
      return;
    }

    this.volume = {
      uncertainty: null,
      value: volume,
      unit: "ml",
    };
  }

  /**
   * Retrieves all chemical inputs to reactor group and computes new stochiometry
   * based on total flow rate and total reactor volume. Chemicals are merged into new
   * ReactorChemicals instance and passed to next reactor component
   * @returns ReactorChemicals
   */
  public getInputs(): ReactorChemicals {
    if (!this.outputNode) {
      throw new Error(`reactor ${this.name} is has no output node`);
    }

    if (!this.volume) {
      throw new Error(`reactor ${this.name} has no volume set`);
    }

    let inputs = this.outputNode.getInputs();

    this.computeTotalFlowRate(inputs);
    this.computeResidenceTime();

    if (!this.flowRate) {
      throw new Error(`reactor ${this.name} has no flow rate set`);
    }

    let newConfigs: CMDL.ChemicalConfig[] = [];
    for (const input of inputs) {
      let chemMoles = input.getByVolume(this.flowRate, this.volume);
      newConfigs = newConfigs.concat(chemMoles);
    }

    let output = new ReactorChemicals(this.flowRate);
    output.setChemicals(newConfigs);

    this.reactorOutput = output.computeValues();

    return output;
  }

  /**
   * Helper method for computing total flow rate for reactor group from inputs
   * @param arr ReactorChemicals[]
   */
  private computeTotalFlowRate(arr: ReactorChemicals[]): void {
    if (!arr.length) {
      throw new Error(
        `Recieved no inputs to compute total flow rate for reactor ${this.name}`
      );
    }

    let newFlowRate = arr.reduce((acc, curr) => {
      return acc.plus(curr.flowRate.value);
    }, Big(0));

    this.flowRate = {
      value: newFlowRate,
      unit: arr[0].flowRate.unit,
      uncertainty: null,
    };
  }

  /**
   * Helper method to estimate residence time for the reactor group
   */
  private computeResidenceTime(): void {
    if (!this.volume || !this.flowRate) {
      throw new Error(
        `incomplete information to compute residence time for reactor ${this.name}`
      );
    }

    if (this.volume.unit !== "ml" || this.flowRate.unit !== "ml/min") {
      throw new Error(
        `volume (${this.volume.unit}) and flow rate (${this.flowRate.unit}) have incompatible units`
      );
    }

    const resTime = this.volume.value
      .div(this.flowRate.value)
      .times(60)
      .round(8);
    this.residenceTime = { unit: "s", value: resTime, uncertainty: null };
  }

  /**
   * Retrieves summary of reactor group parameters and reaction stochiometry
   * for addition to the ModelAR
   * @returns
   */
  public getOutput(): ReactorGroupOutput {
    if (
      !this.volume ||
      !this.flowRate ||
      !this.residenceTime ||
      !this.reactorOutput.length
    ) {
      throw new Error(`reactor ${this.name} output is incomplete!`);
    }

    return {
      name: this.name,
      flowRate: convertQty(this.flowRate),
      residenceTime: convertQty(this.residenceTime),
      volume: convertQty(this.volume),
      reactants: [...this.reactorOutput],
    };
  }

  /**
   * Serializes reactor into an object
   * @returns SerializedReactorGroup
   */
  public serialize(): SerializedReactorGroup {
    return {
      name: this.name,
      type: "reactor",
      parent: this.parent ? this.parent.name : null,
      children: this.children.map((el) => el.name),
    };
  }
}
