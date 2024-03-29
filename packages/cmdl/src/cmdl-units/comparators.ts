import BaseUnit from "./base-unit";
import Unit from "./unit-compound";

/**
 * Creates a map of all base units
 * @param baseUnitArr BaseUnit[]
 * @returns false | Record<string, number>
 */
export function mapBases(
  baseUnitArr: BaseUnit[]
): false | Record<string, number> {
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

/**
 * Diffs two base maps
 * @param obj1 Record<string, number>
 * @param obj2 Record<string, number>
 * @returns boolean
 */
export function diffBaseMap(
  obj1: Record<string, number>,
  obj2: Record<string, number>
): boolean {
  let key: string;
  for (key in obj1) {
    if (!(key in obj2)) {
      return false;
    }
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }
  return true;
}

/**
 * Diffs two Unit classes
 * @param unit1 Unit
 * @param unit2 Unit
 * @returns boolean
 */
export function diffUnits(unit1: Unit, unit2: Unit): boolean {
  if (
    unit1.numerator.length !== unit2.numerator.length &&
    unit1.denominator.length !== unit2.denominator.length
  ) {
    return false;
  }
  const subUnitMap1 = mapBases(unit1.subUnits);
  const subUnitMap2 = mapBases(unit2.subUnits);

  if (subUnitMap1 && subUnitMap2) {
    return diffBaseMap(subUnitMap1, subUnitMap2);
  }
  return false;
}

/**
 * Compares units
 * @param unitMap Record<string, Unit[]>
 * @param keyArr string[]
 * @returns boolean
 */
export function compareDiffUnits(
  unitMap: Record<string, Unit[]>,
  keyArr: string[]
): boolean {
  const stdUnit = unitMap[keyArr[0]][0];
  const otherKeys = keyArr.slice(1);
  while (otherKeys.length) {
    const currKey = otherKeys.shift();

    if (!currKey) {
      break;
    }
    const nextUnit = unitMap[currKey][0];
    const isCompatible = diffUnits(stdUnit, nextUnit);

    if (!isCompatible) {
      return false;
    }
  }
  return true;
}

/**
 * Determines if Units are compatible
 * @param unitArray Unit[]
 * @returns boolean
 */
export function isCompatible(unitArray: Unit[]): boolean {
  if (!unitArray.length) {
    return true;
  }

  if (unitArray.length === 1) {
    return true;
  }

  const unitMap = unitArray.reduce((acc, curr) => {
    if (!(curr.unit in acc)) {
      acc[curr.unit] = [curr];
    } else {
      acc[curr.unit].push(curr);
    }
    return acc;
  }, {} as Record<string, Unit[]>);

  const uniqueUnits = Object.keys(unitMap);

  if (uniqueUnits.length > 1) {
    return compareDiffUnits(unitMap, uniqueUnits);
  }
  return true;
}
