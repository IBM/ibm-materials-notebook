import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";
import { UNITS } from "../units";

const MOL_WEIGHT = [UNITS.Da, UNITS.KDa, UNITS.G_MOL];

const degreePoly: IProperty = {
  description:
    "degree of polymerization for a polymer or polymer architectural subunit",
  detail: "degree of polymerization",
  name: PROPERTIES.DEGREE_POLY,
  type: PropertyTypes.NUMERICAL,
  aliases: ["degree of polymerization"],
  min: 0,
  units: [],
};

const mn_avg: IProperty = {
  description: "number average molecular weight",
  detail: "Mn average",
  name: PROPERTIES.MN_AVG,
  baseUnit: UNITS.G_MOL,
  type: PropertyTypes.NUMERICAL_UNIT,
  aliases: [],
  units: MOL_WEIGHT,
};

const mw_avg: IProperty = {
  description: "weighted average molecular weight",
  detail: "Mw average",
  name: PROPERTIES.MW_AVG,
  baseUnit: UNITS.G_MOL,
  type: PropertyTypes.NUMERICAL_UNIT,
  aliases: [],
  units: MOL_WEIGHT,
};

const dispersity: IProperty = {
  description:
    "distribution of molecular weights in a polymer sample. ratio of Mw/Mn",
  detail: "dispesity or PDI",
  name: PROPERTIES.DISPERSITY,
  type: PropertyTypes.NUMERICAL,
  aliases: [],
  units: [],
  min: 1,
};

export const polymerProperties = [degreePoly, mn_avg, mw_avg, dispersity];
