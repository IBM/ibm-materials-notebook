import Unit from './Unit';
import { isCompatible } from './comparators';
import Big from 'big.js';
import { UnitPrefixes } from './unitConversions';
import { Quantity as QtyUnit } from './unit-types';
import BaseUnit from './BaseUnit';

/**
 *Performs basic unit operations
 */
export default class UnitOperator {
  static sum(unitList: Unit[], scale: UnitPrefixes = 'base') {
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

    let sumObject: QtyUnit = unitList.reduce(
      (acc, item) => {
        item.scaleTo(scale);

        acc.unit = item.unit;
        acc.value = acc.value ? acc.value.plus(item.value) : Big(item.value);
        return acc;
      },
      { unit: '', value: new Big(0), uncertainty: null }
    );
    return sumObject;
  }

  static multiply(unitA: Unit, unitB: Unit) {
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

  static divide(unitA: Unit, unitB: Unit) {
    unitB.invert();
    return UnitOperator.multiply(unitA, unitB);
  }

  static multiplyUnits(subUnitArr: BaseUnit[]) {
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
        let currString = acc.length ? `${acc}*` : '';
        return `${currString}${newUnit}`;
      }, '');

    return newUnitString;
  }
}
