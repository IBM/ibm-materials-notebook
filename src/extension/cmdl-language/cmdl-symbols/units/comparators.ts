import BaseUnit from "./BaseUnit";
import Unit from "./Unit";

export function mapBases(baseUnitArr: BaseUnit[]) {
  if (!baseUnitArr.length) {
    return false;
  }

  return baseUnitArr.reduce((acc, curr) => {
    if (!acc[curr.base]) {
      acc[curr.base] = curr.exponent;
    }
    return acc;
  }, {} as Record<string, number>);
}

export function diffBaseMap(
  obj1: Record<string, number>,
  obj2: Record<string, number>
) {
  let key: string;
  for (key in obj1) {
    if (!obj2.hasOwnProperty(key)) {
      return false;
    }
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}

export function diffUnits(unit1: Unit, unit2: Unit) {
  if (
    unit1.numerator.length !== unit2.numerator.length &&
    unit1.denominator.length !== unit2.denominator.length
  ) {
    return false;
  }
  let subUnitMap1 = mapBases(unit1.subUnits);
  let subUnitMap2 = mapBases(unit2.subUnits);

  if (subUnitMap1 && subUnitMap2) {
    return diffBaseMap(subUnitMap1, subUnitMap2);
  }
  return false;
}

export function compareDiffUnits(
  unitMap: Record<string, Unit[]>,
  keyArr: string[]
) {
  let stdUnit = unitMap[keyArr[0]][0];
  let otherKeys = keyArr.slice(1);
  while (otherKeys.length) {
    let currKey = otherKeys.shift();

    if (!currKey) {
      break;
    }
    let nextUnit = unitMap[currKey][0];
    let isCompatible = diffUnits(stdUnit, nextUnit);

    if (!isCompatible) {
      return false;
    }
  }
  return true;
}

export function isCompatible(unitArray: Unit[]) {
  if (!unitArray.length) {
    return true;
  }

  if (unitArray.length === 1) {
    return true;
  }

  let unitMap = unitArray.reduce((acc, curr) => {
    if (!acc.hasOwnProperty(curr.unit)) {
      acc[curr.unit] = [curr];
    } else {
      acc[curr.unit].push(curr);
    }
    return acc;
  }, {} as Record<string, Unit[]>);

  let uniqueUnits = Object.keys(unitMap);

  if (uniqueUnits.length > 1) {
    return compareDiffUnits(unitMap, uniqueUnits);
  }
  return true;
}
