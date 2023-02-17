import Big from "big.js";

export interface CMDLRef {
  ref: string;
  path: string[];
}

export interface CMDLUnit {
  value: string;
  unit: string | null;
  uncertainty: string | null;
}

export interface NumberQuantity {
  unit: string;
  value: number;
  uncertainty: number | null;
}

export interface Quantity {
  value: Big;
  uncertainty: Big | null;
  unit: string;
}
