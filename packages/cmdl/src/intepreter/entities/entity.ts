import Big from "big.js";
import { TYPES } from "@ibm-materials/cmdl-types";

export interface Clonable {
  clone(): this;
}

export interface Exportable {
  export(): unknown;
}

export type EntityConfigValues = {
  mw: Big;
  density?: Big;
};

export class Entity<T> implements Clonable {
  protected readonly properties: T = {} as T;

  constructor(public name: string, public type: string) {}

  public add<K extends keyof T>(key: K, value: T[K]): void {
    this.properties[key] = value;
  }

  public clone() {
    const clone = Object.create(this);
    return clone;
  }

  protected convertToNumeric(qty: TYPES.BigQty): TYPES.NumericQty {
    return {
      ...qty,
      value: qty.value.toNumber(),
      uncertainty: qty.uncertainty ? qty.uncertainty.toNumber() : null,
    };
  }
}
