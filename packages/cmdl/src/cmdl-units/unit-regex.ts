import { prefixes, UnitBases, UnitPrefixes, units } from "./unit-conversions";

const prefixRegex = Object.keys(prefixes)
  .sort((a, b) => {
    return b.length - a.length;
  })
  .join("|");

const unitRegex = Object.keys(units)
  .sort((a, b) => b.length - a.length)
  .join("|");

const exponentRegex = "(?:\\^)?(?<exponent>[+|-]?\\d$)?";

// const boundaryRegex = "\\b|$";

const unitMatch =
  "(?<prefix>" + prefixRegex + ")?(?<base>" + unitRegex + ")" + exponentRegex;

const unitMatchRegex = new RegExp(unitMatch);

interface ParsedUnit {
  prefix: UnitPrefixes;
  base: UnitBases;
  exponent: number;
  type: [number, string, string];
}

function parseUnit(unit: string): ParsedUnit {
  const matches = unit.match(unitMatchRegex);

  if (!matches || !matches?.groups?.base) {
    throw new Error(`Invalid unit string: ${unit}`);
  }

  const fixedPrefix =
    matches?.groups?.prefix === undefined ? "base" : matches.groups.prefix;
  const fixedExponent =
    matches?.groups?.exponent !== undefined
      ? parseInt(matches.groups.exponent, 10)
      : 1;

  if (!(matches.groups.base in units)) {
    throw new Error(`Invalid unit base: ${matches.groups.base}`);
  }

  const type = units[matches.groups.base as UnitBases];

  return {
    prefix: fixedPrefix as UnitPrefixes,
    base: matches.groups.base as UnitBases,
    exponent: fixedExponent,
    type,
  };
}

export { parseUnit, unitMatchRegex, ParsedUnit };
