import Unit from "./unit-compound";
import { isCompatible } from "./comparators";
import Big from "big.js";
import { UnitPrefixes } from "./unit-conversions";
import BaseUnit from "./base-unit";
import { TYPES } from "../cmdl-types";

/**
 *Performs basic unit operations
 */
export default class UnitOperator {
  /**
   * Sums all Units in an array
   * @param unitList Unit[]
   * @param scale UnitPrefixes
   * @returns CMDL | null
   */
  static sum(
    unitList: Unit[],
    scale: UnitPrefixes = "base"
  ): TYPES.BigQty | null {
    if (!unitList.length) {
      return null;
    }

    if (unitList.length === 1) {
      unitList[0].scaleTo(scale);
      return { ...unitList[0].output(), uncertainty: null };
    }

    const checkUnits = isCompatible(unitList);

    if (!checkUnits) {
      throw new Error(`Attempting to add incompatible units: ${unitList}`);
    }

    const sumObject: TYPES.BigQty = unitList.reduce(
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

    const scalar = unitA.value.times(unitB.value);

    const unit = UnitOperator.multiplyUnits([
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
    const unitMap = subUnitArr.reduce((acc, item) => {
      if (!acc[item.base]) {
        acc[item.base] = item.exponent;
      } else {
        acc[item.base] += item.exponent;
      }
      return acc;
    }, {} as Record<string, number>);

    const newUnitString = Object.keys(unitMap)
      .filter((key) => unitMap[key] !== 0)
      .sort((a, b) => unitMap[b] - unitMap[a])
      .reduce((acc, curr) => {
        const exponent = unitMap[curr];
        const newUnit =
          exponent > 1 || exponent < 0 ? `${curr}^${exponent}` : curr;
        const currString = acc.length ? `${acc}*` : "";
        return `${currString}${newUnit}`;
      }, "");

    return newUnitString;
  }
}
