import { Unit } from "../units";
import { CMDLUnit, Quantity } from "../symbol-types";
import Big from "big.js";
import { ReactorNode, Reactor } from "./reactor-group";
import { ReactorChemicals } from "./reactor-chemicals";

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

  setParent(arg: ReactorNode): void {
    this.parent = arg;
  }

  setInput(arg: ReactorChemicals) {
    this.input = arg;
  }

  setVolume(volume: CMDLUnit) {
    this.volume = this.normalizeVolume(volume);
  }

  addSource(source: ReactorComponent) {
    this.sources.push(source);
  }

  setNext(target: ReactorComponent) {
    this.next = target;
  }

  getInputs(): ReactorChemicals[] {
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

  private exportQty(qty: Quantity | undefined | null): CMDLUnit | undefined {
    if (!qty) {
      return undefined;
    }
    return {
      ...qty,
      value: String(qty.value.toNumber()),
      uncertainty: qty.uncertainty ? String(qty.value.toNumber()) : null,
    };
  }

  serialize() {
    return {
      name: this.name,
      type: "component",
      sources: this.sources.map((el) => el.name),
      next: this.next ? this.next.name : null,
      inner_diameter: this.inner_diameter,
      outer_diameter: this.outer_diameter,
      description: this.description,
      length: this.length,
      volume: this.exportQty(this.volume),
      parent: this.parent ? this.parent.name : null,
    };
  }
}
