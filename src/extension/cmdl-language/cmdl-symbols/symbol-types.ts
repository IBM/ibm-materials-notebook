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

export type CMDLNodeTree = {
  [i: string]: CMDLNodeTree;
};

/**
 * Utility function to convert Quantity back to CMDLUnit
 * @param qty Quantity
 * @returns CMDLUnit
 */
export function convertQty(qty: Quantity): CMDLUnit {
  return {
    ...qty,
    value: String(qty.value.toNumber()),
    uncertainty: qty.uncertainty ? String(qty.value.toNumber()) : null,
  };
}
