import { IUnit, UNITS } from "./unit-types";

const poise: IUnit = {
  symbol: UNITS.POISE,
  regex: new RegExp(UNITS.POISE),
  detail: "poise",
  description: "viscosity unit in poise",
  aliases: ["poise"],
  type: "pressure",
  factor: 0.1,
  base: UNITS.POISE,
  min: 0,
  max: 1.79e308,
};

const stokes: IUnit = {
  symbol: UNITS.STOKES,
  regex: new RegExp(UNITS.STOKES),
  detail: "stokes",
  description: "viscosity unit in stokes",
  aliases: ["stokes"],
  type: "pressure",
  factor: 1e-4,
  base: UNITS.STOKES,
  min: 0,
  max: 1.79e308,
};

export const viscosityUnits = [poise, stokes];
