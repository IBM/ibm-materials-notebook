import Unit from "./Unit";
import { isCompatible } from "./comparators";
import Big from "big.js";
import { UnitPrefixes } from "./unitConversions";
import { Quantity } from "../symbol-types";
import BaseUnit from "./BaseUnit";

/**
 *Performs basic unit operations
 */
export default class UnitOperator {
  /**
   * Sums all Units in an array
   * @param unitList Unit[]
   * @param scale UnitPrefixes
   * @returns Quantity | null
   */
  static sum(unitList: Unit[], scale: UnitPrefixes = "base"): Quantity | null {
    if (!unitList.length) {
      return null;
    }

    if (unitList.length === 1) {
      unitList[0].scaleTo(scale);
      return { ...unitList[0].output(), uncertainty: null };
    }

    let checkUnits = isCompatible(unitList);

    if (!checkUnits) {
      throw new Error(`Attempting to add incompatible units: ${unitList}`);
    }

    let sumObject: Quantity = unitList.reduce(
      (acc, item) => {
        item.scaleTo(scale);

        acc.unit = item.unit;
        acc.value = acc.value ? acc.value.plus(item.value) : Big(item.value);
        return acc;
      },
      { unit: "", value: new Big(0), uncertainty: null }
    );
    return sumObject;
  }

  /**
   * Multiplies two Units
   * @param unitA Unit
   * @param unitB Unit
   * @returns Unit | Big
   */
  static multiply(unitA: Unit, unitB: Unit): Unit | Big {
    unitA.convertToBaseType();
    unitB.convertToBaseType();

    let scalar = unitA.value.times(unitB.value);

    let unit = UnitOperator.multiplyUnits([
      ...unitA.subUnits,
      ...unitB.subUnits,
    ]);

    if (unit.length) {
      return new Unit({ value: scalar, unit, uncertainty: null });
    } else {
      return scalar;
    }
  }

  /**
   * Divides UnitA by UnitB
   * @param unitA Unit
   * @param unitB Unit
   * @returns
   */
  static divide(unitA: Unit, unitB: Unit): Unit | Big {
    unitB.invert();
    return UnitOperator.multiply(unitA, unitB);
  }

  /**
   * Multiplies all units in sub-unit array
   * @param subUnitArr BaseUnit[]
   * @returns string
   */
  static multiplyUnits(subUnitArr: BaseUnit[]): string {
    let unitMap = subUnitArr.reduce((acc, item) => {
      if (!acc[item.base]) {
        acc[item.base] = item.exponent;
      } else {
        acc[item.base] += item.exponent;
      }
      return acc;
    }, {} as Record<string, number>);

    let newUnitString = Object.keys(unitMap)
      .filter((key) => unitMap[key] !== 0)
      .sort((a, b) => unitMap[b] - unitMap[a])
      .reduce((acc, curr) => {
        let exponent = unitMap[curr];
        let newUnit =
          exponent > 1 || exponent < 0 ? `${curr}^${exponent}` : curr;
        let currString = acc.length ? `${acc}*` : "";
        return `${currString}${newUnit}`;
      }, "");

    return newUnitString;
  }
}
