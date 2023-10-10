import Big from "big.js";
import { TYPES } from "@ibm-materials/cmdl-types";
import Unit from "./unit-compound";

const MIN_EXP_PLACES = -3;

/**
 * Minimizes the exponent during stoichiometry calculatiosn
 * @param unit Quantity
 * @returns Object
 */
function minimizeExponent(unit: TYPES.BigQty) {
  if (unit.value.e >= 3 || unit.value.e <= -3) {
    const direction = unit.value.e > 0 ? 1 : -1;
    const scaledUnit = new Unit(unit);
    scaledUnit.scaleToNext(direction);
    return scaledUnit.output();
  }
  return unit;
}

/**
 * Handles rounding of numeric values during stoichiometry calculations
 * @param unit TYPES.BigQty | null
 * @param adjustExponent boolean
 * @returns NumberQuantity
 */
export function handleRounding(
  unit: TYPES.BigQty | null,
  adjustExponent = false
): TYPES.NumericQty {
  if (!unit) {
    throw new Error(`Unit is not defined: ${unit}`);
  }

  let decimalPlaces = 4;

  if (adjustExponent) {
    const updatedUnit = minimizeExponent(unit);
    return {
      ...updatedUnit,
      value: Big(updatedUnit.value).round(decimalPlaces).toNumber(),
      uncertainty: null,
    };
  }

  if (unit.value.e <= MIN_EXP_PLACES) {
    decimalPlaces = 6;
  }

  return {
    ...unit,
    value: unit.value.round(decimalPlaces).toNumber(),
    uncertainty: null,
  };
}

/**
 * Utility function to convert Quantity back to CMDLUnit
 * @param qty Quantity
 * @returns CMDLUnit
 */
export function convertQty(qty: TYPES.BigQty): TYPES.NumericQty {
  return {
    ...qty,
    value: qty.value.toNumber(),
    uncertainty: qty.uncertainty ? qty.value.toNumber() : null,
  };
}
