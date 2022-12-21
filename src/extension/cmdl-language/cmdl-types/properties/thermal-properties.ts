import { UNITS } from "../units";
import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";

export const THERMAL_UNITS = [UNITS.DEGC, UNITS.DEGK];

const tempGlass: IProperty = {
  detail: "Tg",
  description: "glass transition temperature",
  name: PROPERTIES.TEMP_GLASS,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: ["Tg", "tg"],
  units: THERMAL_UNITS,
};

const tempMelt: IProperty = {
  detail: "Tm",
  description: "melting point",
  name: PROPERTIES.TEMP_MELT,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: ["melting point", "tm"],
  units: THERMAL_UNITS,
};

const tempCrystal: IProperty = {
  detail: "Tc",
  description: "crystalization temperature, freezing point",
  name: PROPERTIES.TEMP_CRYSTAL,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: [],
  units: THERMAL_UNITS,
};

const tempBoiling: IProperty = {
  detail: "boiling point",
  description: "boiling point",
  name: PROPERTIES.TEMP_BOILING,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: ["boiling point"],
  units: THERMAL_UNITS,
};

const tempDegrade: IProperty = {
  detail: "degredation temperature",
  description: "glass transition temperature",
  name: PROPERTIES.TEMP_DEGRADE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: ["degredation temperature"],
  units: THERMAL_UNITS,
};

const tempOnset: IProperty = {
  detail: "onset temperature",
  description: "onset temperature",
  name: PROPERTIES.TEMP_ONSET,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: [],
  units: THERMAL_UNITS,
};

const tempSublime: IProperty = {
  detail: "sublimation point",
  description: "temperature of sublimation",
  name: PROPERTIES.TEMP_SUBLIME,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: ["sublimation point"],
  units: THERMAL_UNITS,
};

export const thermalProperties = [
  tempBoiling,
  tempCrystal,
  tempMelt,
  tempGlass,
  tempDegrade,
  tempOnset,
  tempSublime,
];
