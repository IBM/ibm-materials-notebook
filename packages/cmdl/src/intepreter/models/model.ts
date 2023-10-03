import Big from "big.js";
import { TYPES } from "cmdl-types";

export interface Clonable {
  clone(): this;
}

export interface Exportable<T> {
  export(): T;
}

export type EntityConfigValues = {
  mw: Big;
  density?: Big;
  state: TYPES.ChemStates;
};

export interface ChemicalEntity {
  getConfigValues(): EntityConfigValues;
}

export class Model<T> implements Clonable, Exportable<T> {
  protected readonly properties: T = {} as T;

  constructor(public name: string, public type: string) {}

  public add<K extends keyof T>(key: K, value: T[K]): void {
    this.properties[key] = value;
  }

  public clone() {
    const clone = Object.create(this);
    return clone;
  }

  public export(): T {
    return { ...this.properties, name: this.name, type: this.type };
  }

  protected convertToNumeric(qty: TYPES.BigQty): TYPES.NumericQty {
    return {
      ...qty,
      value: qty.value.toNumber(),
      uncertainty: qty.uncertainty ? qty.uncertainty.toNumber() : null,
    };
  }
}
