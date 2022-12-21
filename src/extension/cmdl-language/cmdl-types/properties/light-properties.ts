import { UNITS } from "../units";
import { IProperty, PropertyTypes, PROPERTIES } from "./property-types";

const lightIrradiance: IProperty = {
  detail: "light power area",
  description: "light power area",
  name: PROPERTIES.LIGHT_IRR,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.MW_CM2,
  aliases: [],
  units: [UNITS.MW_CM2],
};

const lightPower: IProperty = {
  detail: "light power",
  description: "light power hitting a surface",
  name: PROPERTIES.LIGHT_PWR,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.W,
  aliases: [],
  units: [UNITS.W],
};

const lightPowerElec: IProperty = {
  detail: "light power (electricity)",
  description: "electric power driving light source",
  name: PROPERTIES.LIGHT_PWR_ELEC,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.W,
  aliases: [],
  units: [UNITS.W],
};

export const lightProperties = [lightIrradiance, lightPower, lightPowerElec];
