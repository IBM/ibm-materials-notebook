import { Quantity, CMDLUnit } from "./symbol-types";

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
