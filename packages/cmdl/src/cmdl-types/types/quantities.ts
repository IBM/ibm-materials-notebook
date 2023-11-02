import { PROPERTIES } from "../properties";
import Big from "big.js";

export interface Qty {
  value: Big | string | number;
  unit: string | null;
  uncertainty: Big | string | number | null;
}

export interface BigQty {
  value: Big;
  unit: string;
  uncertainty: Big | null;
}

export interface BigQtyUnitless {
  value: Big;
  unit: null;
  uncertainty: Big | null;
}

export interface StringQtyUnitless extends Qty {
  value: string;
  unit: null;
  uncertainty: string | null;
}

export interface StringQty extends Qty {
  value: string;
  unit: string;
  uncertainty: string | null;
}

export interface NumericQty extends Qty {
  value: number;
  unit: string;
  uncertainty: number | null;
}

export interface NumericQtyUnitless extends Qty {
  value: number;
  unit: null;
  uncertainty: number | null;
}

export interface MeasuredProperty {
  value: Big;
  uncertainty: Big | null;
  unit: string | null;
  technique: string;
  path?: string[];
  source: string;
}

export type QuantityNames =
  | PROPERTIES.MASS
  | PROPERTIES.VOLUME
  | PROPERTIES.MOLES
  | PROPERTIES.PRESSURE;

export interface NamedQty extends BigQty {
  name:
    | PROPERTIES.MASS
    | PROPERTIES.VOLUME
    | PROPERTIES.MOLES
    | PROPERTIES.PRESSURE;
}

type ConvertToNumeric<T> = T extends BigQty ? NumericQty : T;

export type Export<T> = {
  [Property in keyof T]: ConvertToNumeric<T[Property]>;
};
