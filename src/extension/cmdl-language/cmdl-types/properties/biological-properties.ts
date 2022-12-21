import { IProperty, PropertyTypes, PROPERTIES } from "./property-types";
import { UNITS } from "../units";

const CONC_UNITS = [UNITS.MCG_ML, UNITS.MG_L];

const mic: IProperty = {
  description: "minimum inhibitory concentration of a substance",
  type: PropertyTypes.NUMERICAL_UNIT,
  detail: "MIC value",
  name: PROPERTIES.MIC,
  baseUnit: UNITS.MCG_ML,
  aliases: [],
  units: CONC_UNITS,
};

const treatmentConc: IProperty = {
  description: "treatement concentration of substance in cell viability assay",
  detail: "treatment concentration",
  type: PropertyTypes.NUMERICAL_UNIT,
  name: PROPERTIES.TREATMENT_CONC,
  baseUnit: UNITS.MCG_ML,
  aliases: [],
  units: CONC_UNITS,
};

const hc50: IProperty = {
  description: "hemolysis concentration at which 50% of rRBCs perish",
  detail: "HC50 value",
  type: PropertyTypes.NUMERICAL_UNIT,
  name: PROPERTIES.HC50,
  baseUnit: UNITS.MCG_ML,
  aliases: [],
  units: CONC_UNITS,
};

const cellViability: IProperty = {
  description: "percent cell viability at a given treatment concentration",
  detail: "cell viability",
  name: PROPERTIES.CELL_VIABILITY,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.PERCENT,
  aliases: [],
  units: [UNITS.PERCENT],
};

const zetaPotential: IProperty = {
  description: "zeta potential of a supermolecular complex",
  detail: "zeta potential",
  name: PROPERTIES.ZETA_POTENTIAL,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.MV,
  aliases: [],
  units: [UNITS.MV],
  min: -1.79e308,
  max: 1.79e308,
};

const cmc: IProperty = {
  description: "critical micelle concentration of a polymer or substance",
  detail: "CMC value",
  name: PROPERTIES.CMC,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.MG_L,
  aliases: [],
  units: [UNITS.MG_L],
};

const dh: IProperty = {
  description: "hydrodynamic radius of material",
  detail: "Dh radius",
  name: PROPERTIES.DH,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.NM,
  aliases: ["hydrodynamic radius"],
  units: [UNITS.NM],
};

const dh_pdi: IProperty = {
  description: "dispersity of hydrodynamic radii of material",
  detail: "Dh PDI",
  name: PROPERTIES.DH_PDI,
  type: PropertyTypes.NUMERICAL,
  aliases: ["hydrodynamic radius dispersity"],
};

const loadingCapacity: IProperty = {
  description: "cargo capacity of a micelle or hydrogel",
  detail: "loading capacity",
  name: PROPERTIES.LOADING_CAPACITY,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.WT_PERCENT,
  aliases: [],
  units: [UNITS.WT_PERCENT],
};

export const biologicalProperties = [
  mic,
  treatmentConc,
  hc50,
  cellViability,
  zetaPotential,
  loadingCapacity,
  cmc,
  dh,
  dh_pdi,
];
