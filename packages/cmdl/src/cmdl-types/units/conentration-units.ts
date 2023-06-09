import { IUnit, UNITS } from "./unit-types";

export const molarity: IUnit = {
  symbol: UNITS.MOL_L,
  regex: /mol\/l/,
  aliases: ["molarity"],
  detail: "molarity",
  description: "units of concentration expressed in mol/l",
  type: "concentration",
  base: UNITS.MOL_L,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const molality: IUnit = {
  symbol: UNITS.MOL_KG,
  regex: /mol\/kg/,
  aliases: ["molality"],
  type: "concentration",
  detail: "molality",
  description: "units of concentration expressed in mol/kg",
  base: UNITS.MOL_KG,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const mcgMl: IUnit = {
  symbol: UNITS.MCG_ML,
  regex: /mcg\/ml/,
  aliases: [],
  detail: "micrograms per milliliter",
  description: "concentration unit in micrograms per milliliter",
  type: "concentration",
  base: UNITS.MCG_ML,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const mgl: IUnit = {
  symbol: UNITS.MG_L,
  regex: /mg\/ml/,
  aliases: [],
  type: "concentration",
  detail: "milligrams per liter",
  description: "concentration unit in milligrams per liter",
  base: UNITS.MG_L,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const density: IUnit = {
  symbol: UNITS.G_ML,
  regex: /g\/ml/,
  aliases: ["density"],
  detail: "density",
  description: "density units expressed in g/ml",
  type: "density",
  base: UNITS.G_ML,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const concentrationUnits = [molality, molarity, mcgMl, mgl, density];
