import { IProperty, PropertyTypes, PROPERTIES } from "./property-types";
import { UNITS } from "../units";

const LENGTH_UNITS = [
  UNITS.PM,
  UNITS.NM,
  UNITS.MCM,
  UNITS.MM,
  UNITS.DM,
  UNITS.CM,
  UNITS.M,
  UNITS.DAM,
  UNITS.HM,
  UNITS.KM,
  UNITS.M_M,
  UNITS.GM,
];

const equipmentLength: IProperty = {
  description: "length of an item",
  detail: "equip. length",
  type: PropertyTypes.NUMERICAL_UNIT,
  name: PROPERTIES.LENGTH,
  baseUnit: UNITS.CM,
  aliases: [],
  units: LENGTH_UNITS,
};

const outerDiameter: IProperty = {
  description: "outer diameter of reactor tubing",
  detail: "outer diameter",
  type: PropertyTypes.NUMERICAL_UNIT,
  name: PROPERTIES.OUTER_DIAMETER,
  baseUnit: UNITS.MM,
  aliases: [],
  units: LENGTH_UNITS,
};

const innerDiameter: IProperty = {
  description: "inner diameter of reactor tubing",
  detail: "inner diameter",
  type: PropertyTypes.NUMERICAL_UNIT,
  name: PROPERTIES.INNER_DIAMETER,
  baseUnit: UNITS.MM,
  aliases: [],
  units: LENGTH_UNITS,
};

export const equipmentProperties = [
  equipmentLength,
  outerDiameter,
  innerDiameter,
];
