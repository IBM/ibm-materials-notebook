import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";
import { UNITS } from "../units";

const molecularWeight: IProperty = {
  description: "molecular weight of discrete chemical compound",
  detail: "molecular weight",
  name: PROPERTIES.MOL_WEIGHT,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.G_MOL,
  aliases: [],
  units: [UNITS.G_MOL],
};

const density: IProperty = {
  description: "density of a chemical compound",
  detail: "density",
  name: PROPERTIES.DENSITY,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.G_ML,
  aliases: [],
  units: [UNITS.G_ML],
};

const quantity: IProperty = {
  description: "general numerical quantity",
  detail: "quantity",
  name: PROPERTIES.QUANTITY,
  type: PropertyTypes.NUMERICAL,
  aliases: [],
};

export const physicalProperties = [molecularWeight, density, quantity];
