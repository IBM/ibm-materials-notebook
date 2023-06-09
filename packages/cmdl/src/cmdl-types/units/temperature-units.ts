import { IUnit, UNITS } from "./unit-types";

const kelvin: IUnit = {
  symbol: UNITS.DEGK,
  regex: new RegExp(UNITS.DEGK),
  detail: "degrees kelvin",
  description: "temperature unit in degrees kelvin",
  aliases: ["kelvin"],
  type: "temperature",
  factor: 1,
  base: UNITS.DEGK,
  min: 0,
  max: 1.79e308,
};

const celsius: IUnit = {
  symbol: UNITS.DEGC,
  regex: new RegExp(UNITS.DEGC),
  detail: "degrees centigrade",
  description: "temperature unit in degrees centigrade",
  aliases: ["celsius", "centigrade"],
  type: "temperature",
  factor: 1,
  base: UNITS.DEGC,
  min: -273.15,
  max: 1.79e308,
};

export const temperatureUnits = [kelvin, celsius];
