import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";
import { UNITS } from "../units";

const wavelength: IProperty = {
  name: PROPERTIES.WAVELENGTH,
  description: "wavelength property of light",
  detail: "wavelength (nm)",
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.NM,
  aliases: [],
  units: [UNITS.NM],
};

const wavenumber: IProperty = {
  name: PROPERTIES.WAVENUMBER,
  description: "wavenumber in inverse centimeters",
  detail: "wavenumber (1/cm)",
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS._CM,
  aliases: [],
  units: [UNITS._CM],
};

const lambda_max_abs: IProperty = {
  name: PROPERTIES.LAMBDA_MAX_ABS,
  description: "wavelength of maximal absorption in spectrum",
  detail: "max. absorbtion wavelength",
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.NM,
  aliases: [],
  units: [UNITS.NM],
};

const lambda_max_ems: IProperty = {
  name: PROPERTIES.LAMBDA_MAX_EMS,
  description: "wavelength of maximal emission in spectrum",
  detail: "max. emission wavelength",
  type: PropertyTypes.NUMERICAL_UNIT,
  baseUnit: UNITS.NM,
  aliases: [],
  units: [UNITS.NM],
};

export const spectralProperties = [
  wavelength,
  wavenumber,
  lambda_max_abs,
  lambda_max_ems,
];
