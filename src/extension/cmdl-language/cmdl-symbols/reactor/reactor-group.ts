import Big from "big.js";
import { QtyUnit } from "../units";
import { ReactorComponent } from "./reactor-component";
import { ChemicalConfig, ChemicalOutput } from "../chemicals/chemical-factory";
import { ReactorChemicals } from "./reactor-chemicals";

export interface ReactorNode {
  name: string;
  parent: ReactorNode | null;
  volume: QtyUnit | null;
  setParent(arg: ReactorNode): void;
  getInputs(): any;
}

export class Reactor implements ReactorNode {
  volume: QtyUnit | null = null;
  flowRate: QtyUnit | null = null;
  residenceTime: QtyUnit | null = null;
  reactorOutput: ChemicalOutput[] = [];
  outputNode: ReactorComponent | null = null;
  parent: ReactorNode | null = null;
  children: ReactorNode[] = [];

  constructor(public name: string) {}

  setOutputNode() {
    for (const child of this.children) {
      if (
        child instanceof ReactorComponent &&
        (!child.next || child.next.parent !== this)
      ) {
        this.outputNode = child;
      }
    }
  }

  add(child: ReactorNode) {
    child.setParent(this);
    this.children.push(child);
  }

  setParent(arg: ReactorNode): void {
    this.parent = arg;
  }

  computeVolume() {
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

  getInputs(): ReactorChemicals {
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

    let newConfigs: ChemicalConfig[] = [];
    for (const input of inputs) {
      let chemMoles = input.getByVolume(this.flowRate, this.volume);
      newConfigs = newConfigs.concat(chemMoles);
    }

    let output = new ReactorChemicals(this.flowRate);
    output.setChemicals(newConfigs);

    this.reactorOutput = output.computeValues();

    return output;
  }

  private computeTotalFlowRate(arr: ReactorChemicals[]) {
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

  private computeResidenceTime() {
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

  getOutput() {
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
      flowRate: { ...this.flowRate, value: this.flowRate.value.toNumber() },
      residenceTime: {
        ...this.residenceTime,
        value: this.residenceTime.value.round(4).toNumber(),
      },
      volume: { ...this.volume, value: this.volume.value.toNumber() },
      reactants: [...this.reactorOutput],
    };
  }

  serialize() {
    return {
      name: this.name,
      type: "reactor",
      parent: this.parent ? this.parent.name : null,
      children: this.children.map((el) => el.name),
    };
  }
}
