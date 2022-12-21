import { IUnit, UNITS } from "./unit-types";

const dalton: IUnit = {
  symbol: UNITS.Da,
  aliases: ["Dalton", "Daltons"],
  regex: new RegExp(UNITS.Da),
  detail: "daltons",
  description: "mass unit in daltons",
  type: "mass",
  factor: 1.660538921e-27,
  base: UNITS.KG,
  min: 0,
  max: 1.79e308,
};

const kilodalton: IUnit = {
  symbol: UNITS.KDa,
  regex: new RegExp(UNITS.KDa),
  detail: "kilodaltons",
  description: "mass unit in kilodaltons",
  aliases: ["Kilodalton", "kilodaltons"],
  type: "mass",
  factor: 1.660538921e-24,
  base: UNITS.KG,
  min: 0,
  max: 1.79e308,
};

const molarMass: IUnit = {
  symbol: UNITS.G_MOL,
  regex: /g\/mol/,
  detail: "grams per mol",
  description: "molecular weight unit in grams per mol",
  aliases: ["g*mol^-1"],
  type: "mass",
  factor: 1,
  base: UNITS.G_MOL,
  min: 0,
  max: 1.79e308,
};

export const molWeightUnits = [kilodalton, dalton, molarMass];
