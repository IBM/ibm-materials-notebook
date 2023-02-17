const prefixes = {
  M: 1e6,
  k: 1e3,
  h: 1e2,
  da: 1e1,
  base: 1,
  d: 1e-1,
  c: 1e-2,
  m: 1e-3,
  mc: 1e-6,
  n: 1e-9,
  p: 1e-12,
};

type UnitPrefixes = keyof typeof prefixes | "base";

const units = {
  g: [1.0, "mass", "g"],
  l: [1.0, "volume", "l"],
  m: [1.0, "length", "m"],
  mol: [1.0, "amount", "mol"],
  s: [1.0, "time", "s"],
  min: [60, "time", "s"],
  h: [3600, "time", "s"],
  d: [86400, "time", "s"],
  degC: [1.0, "temperature", "degC"],
  Pa: [1.0, "pressure", "Pa"],
  atm: [101325, "pressure", "Pa"],
  bar: [1e5, "pressure", "Pa"],
  Psi: [6894.76, "pressure", "Pa"],
  torr: [133.322, "pressure", "Pa"],
};

type UnitBases = keyof typeof units;

export { prefixes, units, UnitBases, UnitPrefixes };
