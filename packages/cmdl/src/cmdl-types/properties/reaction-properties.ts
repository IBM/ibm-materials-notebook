import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";
import { THERMAL_UNITS } from "./thermal-properties";
import { UNITS } from "../units";

const TIME_UNITS = [UNITS.MS, UNITS.SEC, UNITS.MIN, UNITS.HOUR, UNITS.DAY];
const VOL_UNITS = [
  UNITS.PL,
  UNITS.NL,
  UNITS.MCL,
  UNITS.ML,
  UNITS.DL,
  UNITS.CL,
  UNITS.L,
  UNITS.DAL,
  UNITS.HL,
  UNITS.KL,
  UNITS.M_L,
  UNITS.GL,
];

const MASS_UNITS = [
  UNITS.PG,
  UNITS.NG,
  UNITS.MCG,
  UNITS.MG,
  UNITS.DG,
  UNITS.CG,
  UNITS.G,
  UNITS.DAG,
  UNITS.HG,
  UNITS.KG,
  UNITS.M_G,
  UNITS.GG,
];

const MOL_UNITS = [
  UNITS.PMOL,
  UNITS.NMOL,
  UNITS.MCMOL,
  UNITS.MMOL,
  UNITS.DMOL,
  UNITS.CMOL,
  UNITS.MOL,
  UNITS.DAMOL,
  UNITS.HMOL,
  UNITS.KMOL,
  UNITS.M_MOL,
  UNITS.GMOL,
];

const POTENTIAL_UNITS = [
  UNITS.PV,
  UNITS.NV,
  UNITS.MCV,
  UNITS.MV,
  UNITS.DV,
  UNITS.CV,
  UNITS.V,
  UNITS.DAV,
  UNITS.HV,
  UNITS.KV,
  UNITS.M_V,
  UNITS.GV,
];

const PRESSURE_UNITS = [
  UNITS.PA,
  UNITS.KPA,
  UNITS.MPA,
  UNITS.ATM,
  UNITS.BAR,
  UNITS.MBAR,
  UNITS.TORR,
  UNITS.MTORR,
  UNITS.MMHG,
  UNITS.INH2O,
  UNITS.CMH2O,
];

const RATE_UNITS = [UNITS.ML_MIN, UNITS.NL_MIN, UNITS.MCL_MIN];

const conversion: IProperty = {
  description: "percent conversion of a chemical species",
  detail: "conversion (%)",
  name: PROPERTIES.CONVERSION,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.PERCENT,
  aliases: [],
  units: [UNITS.PERCENT],
};

const mass: IProperty = {
  description: "mass of a chemical species used in a reaction or isolated",
  detail: "mass of chemical",
  name: PROPERTIES.MASS,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.MG,
  aliases: [],
  units: MASS_UNITS,
};

const pressure: IProperty = {
  description: "pressure of a reaction or reactor",
  detail: "pressure (atm)",
  name: PROPERTIES.PRESSURE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.ATM,
  aliases: [],
  units: PRESSURE_UNITS,
};

const moles: IProperty = {
  description: "moles of a chemical species used in a reaction",
  detail: "moles of chemical",
  name: PROPERTIES.MOLES,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.MMOL,
  aliases: [],
  units: MOL_UNITS,
};

const volume: IProperty = {
  description: "volume of a chemical species used in a reaction",
  detail: "volume of chemical",
  name: PROPERTIES.VOLUME,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.ML,
  aliases: [],
  units: VOL_UNITS,
};

const percentYield: IProperty = {
  description: "percent yield of a chemical species",
  detail: "yield (%)",
  name: PROPERTIES.YIELD,
  baseUnit: UNITS.PERCENT,
  type: PropertyTypes.NUMERICAL_UNIT,
  aliases: [],
  units: [UNITS.PERCENT],
};

const reaction_time: IProperty = {
  description: "Full time duration of a reaction as measured experimentally.",
  detail: "Time of reaction.",
  name: PROPERTIES.REACTION_TIME,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.SEC,
  aliases: [],
  units: TIME_UNITS,
};

const time_point: IProperty = {
  description: "Time point from reaction for a sample",
  detail: "Time point of sample which was taken for characterization",
  name: PROPERTIES.TIME_POINT,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.SEC,
  aliases: [],
  units: TIME_UNITS,
};

const run_time: IProperty = {
  description: "full time duration of the flow reaction",
  detail: "run time of flow reactor",
  name: PROPERTIES.RUN_TIME,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.SEC,
  aliases: [],
  units: TIME_UNITS,
};

const collection_time: IProperty = {
  description: "collection time point from the flow reactor",
  detail: "collection time of flow reactor",
  name: PROPERTIES.COLLECTION_TIME,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.SEC,
  aliases: [],
  units: TIME_UNITS,
};

// const reaction_volume: IProperty = {
//   description: "volume of the reaction vessel",
//   detail: "volume of reaction vessel",
//   name: PROPERTIES.VOLUME,
//   type: PropertyTypes.NUMERICAL_UNIT,
//   baseUnit: UNITS.ML,
//   aliases: [],
//   units: VOL_UNITS,
// };

const reaction_temp: IProperty = {
  description: "overall temperature of the reaction",
  detail: "reaction temperature",
  name: PROPERTIES.TEMPERATURE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.DEGC,
  aliases: [],
  units: THERMAL_UNITS,
};

const flowRate: IProperty = {
  description: "flow rate of continuous flow reactor",
  detail: "flow rate for reactor",
  name: PROPERTIES.FLOW_RATE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.ML_MIN,
  aliases: [],
  units: RATE_UNITS,
};

const mixingRate: IProperty = {
  description: "mixing rate of reactor or other process.",
  detail: "mixing rate for reaction",
  name: PROPERTIES.MIX_RATE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.RPM,
  aliases: ["stir_rate"],
  units: [UNITS.RPM, UNITS.RADIAN_S],
};

const pressureRate: IProperty = {
  description: "pressure rate change.",
  detail: "pressure rate change",
  name: PROPERTIES.PRESSURE_RATE,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.KPA_S,
  aliases: [],
  units: [UNITS.KPA_S],
};

const potential: IProperty = {
  description: "electric potential",
  detail: "electric potential",
  name: PROPERTIES.POTENTIAL,
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.V,
  aliases: [],
  units: POTENTIAL_UNITS,
};

const pH: IProperty = {
  description: "hydrogen ion concentration in solution",
  detail: "pH (-5-18)",
  name: PROPERTIES.PH,
  type: PropertyTypes.NUMERICAL,
  aliases: [],
  units: [],
  min: -5,
  max: 18,
};

const ratio: IProperty = {
  description: "ratio of components or reactants",
  detail: "ratio",
  name: PROPERTIES.RATIO,
  type: PropertyTypes.NUMERICAL,
  aliases: [],
  units: [],
  min: 0,
};

export const reactionProperties = [
  conversion,
  percentYield,
  reaction_temp,
  // reaction_volume,
  reaction_time,
  run_time,
  collection_time,
  flowRate,
  mass,
  volume,
  moles,
  pressure,
  mixingRate,
  pH,
  pressureRate,
  potential,
  ratio,
  time_point,
];
