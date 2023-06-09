import Big from "big.js";
import { NumberQuantity, Quantity } from "../symbols/symbol-types";
import { Unit } from "../symbols/units";

const MIN_EXP_PLACES = -3;

/**
 * Minimizes the exponent during stoichiometry calculatiosn
 * @param unit Quantity
 * @returns Object
 */
function minimizeExponent(unit: Quantity) {
  if (unit.value.e >= 3 || unit.value.e <= -3) {
    let direction = unit.value.e > 0 ? 1 : -1;
    let scaledUnit = new Unit(unit);
    scaledUnit.scaleToNext(direction);
    return scaledUnit.output();
  }
  return unit;
}

/**
 * Handles rounding of numeric values during stoichiometry calculations
 * @param unit Quantity | null
 * @param adjustExponent boolean
 * @returns NumberQuantity
 */
export function handleRounding(
  unit: Quantity | null,
  adjustExponent = false
): NumberQuantity {
  if (!unit) {
    throw new Error(`Unit is not defined: ${unit}`);
  }

  let decimalPlaces = 4;

  if (adjustExponent) {
    let updatedUnit = minimizeExponent(unit);
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
 * Removes double quotes from string images after tokenization of CMDL
 * @param strImage string
 * @returns string
 */
export function parseStringImage(strImage: string) {
  return strImage.slice(1, strImage.length - 1);
}
