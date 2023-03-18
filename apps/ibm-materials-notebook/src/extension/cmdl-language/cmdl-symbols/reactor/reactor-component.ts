import { Unit } from "../units";
import { CMDLUnit, Quantity } from "../symbol-types";
import { convertQty } from "../utils";
import Big from "big.js";
import { ReactorNode, Reactor } from "./reactor-group";
import { ReactorChemicals } from "./reactor-chemicals";
import { SerializedReactorComponent } from "./reactor-container";

/**
 * Class representing an individual component in a continuous-flow reactor
 */
export class ReactorComponent implements ReactorNode {
  input: ReactorChemicals | null = null;
  sources: ReactorComponent[] = [];
  next: ReactorComponent | null = null;
  volume: Quantity | null = null;
  length?: CMDLUnit;
  inner_diameter?: CMDLUnit;
  outer_diameter?: CMDLUnit;
  description?: string;
  parent: ReactorNode | null = null;

  constructor(public name: string) {}

  /**
   * Sets the parent reactor group of the reactor component
   * @param arg ReactorNode
   */
  public setParent(arg: ReactorNode): void {
    this.parent = arg;
  }

  /**
   * Sets reactor chemicals as an input to the reactor component
   * @param arg ReactorChemcials
   */
  public setInput(arg: ReactorChemicals): void {
    this.input = arg;
  }

  /**
   * Sets the volume of the reactor component
   * @param volume CMDLUnit
   */
  public setVolume(volume: CMDLUnit): void {
    this.volume = this.normalizeVolume(volume);
  }

  /**
   * Adds a input source to this reactor component. May have more than one.
   * @param source ReactorComponent
   */
  public addSource(source: ReactorComponent): void {
    this.sources.push(source);
  }

  /**
   * Sets the reactor component which is next in the overall reactor.
   * A reactor component may have one or no targets
   * @param target ReactorComponent
   */
  public setNext(target: ReactorComponent): void {
    this.next = target;
  }

  /**
   * Recursively gathers inputs to current node from parent nodes
   * @returns ReactorChemicals[]
   */
  public getInputs(): ReactorChemicals[] {
    if (!this.sources.length && !this.input) {
      throw new Error(
        `No inputs to retrieve for reactor component ${this.name}`
      );
    }

    if (this.input && this.sources.length) {
      throw new Error(
        `Mismatched input and chemical sources for ${this.name}, node can have sources or input`
      );
    }

    if (this.input) {
      return [this.input];
    } else {
      let inputs: ReactorChemicals[] = [];

      for (const source of this.sources) {
        if (
          source.parent &&
          source.parent instanceof Reactor &&
          source.parent.name !== this.parent?.name //not in same reactor
        ) {
          let reactorOutput = source.parent.getInputs();
          inputs.push(reactorOutput);
        } else {
          let sourceOutput = source.getInputs();
          inputs = inputs.concat(sourceOutput);
        }
      }
      return inputs;
    }
  }

  /**
   * Normalizes component volume to ml for calculation purposes
   * @param vol CMDLUnit
   * @returns Quantity
   */
  private normalizeVolume(vol: CMDLUnit): Quantity {
    if (!vol.unit) {
      throw new Error(`Missing unit for volume in reactor component!`);
    }

    if (vol.unit !== "ml") {
      let normalVol = new Unit({
        unit: vol.unit,
        value: Big(vol.value),
        uncertainty: vol.uncertainty ? Big(vol.uncertainty) : null,
      });
      normalVol.convertTo("ml");
      return { ...normalVol.output(), uncertainty: null };
    } else {
      return {
        unit: vol.unit,
        value: Big(vol.value),
        uncertainty: null,
      };
    }
  }

  /**
   * Serializes reactor componet to object.
   * @returns SerializedReactorComponent
   */
  public serialize(): SerializedReactorComponent {
    return {
      name: this.name,
      type: "component",
      sources: this.sources.map((el) => el.name),
      next: this.next ? this.next.name : null,
      inner_diameter: this.inner_diameter,
      outer_diameter: this.outer_diameter,
      description: this.description,
      length: this.length,
      volume: this.volume ? convertQty(this.volume) : undefined,
      parent: this.parent ? this.parent.name : null,
    };
  }
}
