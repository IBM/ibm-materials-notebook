import { IUnit, UNITS } from './unit-types';

export const lengthUnits: IUnit[] = [
  {
    symbol: UNITS.GM,
    regex: new RegExp(UNITS.GM),
    detail: 'gigameter',
    description: 'length unit in gigameters',
    aliases: ['Gigameter', 'gigameter'],
    factor: 1e9,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.M_M,
    regex: new RegExp(UNITS.M_M),
    detail: 'megameter',
    description: 'length unit in megameters',
    aliases: ['Megameter', 'megameter'],
    factor: 1e6,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.KM,
    regex: new RegExp(UNITS.KM),
    detail: 'kilometer',
    description: 'length unit in kilometers',
    aliases: ['kilometer'],
    factor: 1e3,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.HM,
    regex: new RegExp(UNITS.HM),
    detail: 'hectometer',
    description: 'length unit in hectometers',
    aliases: ['Hectometer', 'hectometer'],
    factor: 1e2,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DAM,
    regex: new RegExp(UNITS.DAM),
    detail: 'decameter',
    description: 'length unit in decameters',
    aliases: ['Decameter', 'decameter'],
    factor: 1e1,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.M,
    regex: new RegExp(UNITS.M),
    detail: 'meter',
    description: 'length unit in meters',
    aliases: ['meter', 'meters'],
    type: 'length',
    factor: 1,
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DM,
    regex: new RegExp(UNITS.DM),
    detail: 'decimeter',
    description: 'length unit in decimeters',
    aliases: ['Decimeter', 'decimeter'],
    factor: 1e-1,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.CM,
    regex: new RegExp(UNITS.CM),
    detail: 'centimeter',
    description: 'length unit in centimeters',
    aliases: ['Centimeter', 'centimeter'],
    factor: 1e-2,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MM,
    regex: new RegExp(UNITS.MM),
    detail: 'millimeter',
    description: 'length unit in millimeters',
    aliases: ['Millimeter', 'millimeter'],
    factor: 1e-3,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MCM,
    regex: new RegExp(UNITS.MCM),
    detail: 'micrometer',
    description: 'length unit in micrometers',
    aliases: ['Micrometer', 'micrometer'],
    factor: 1e-6,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.NM,
    regex: new RegExp(UNITS.NM),
    detail: 'nanometer',
    description: 'length unit in nanometers',
    aliases: ['Nanometer', 'nanometer'],
    factor: 1e-9,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.PM,
    regex: new RegExp(UNITS.PM),
    detail: 'picometer',
    description: 'length unit in picometers',
    aliases: ['Picometer', 'picometer'],
    factor: 1e-12,
    type: 'length',
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.ANG,
    regex: new RegExp(UNITS.ANG),
    detail: 'angstrom',
    description: 'length unit in angstroms',
    aliases: ['angstrom', 'angstroms'],
    type: 'length',
    factor: 1e-10,
    base: UNITS.M,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS._CM,
    regex: /1\/cm/,
    detail: 'inverse centimeter',
    description: 'wavenumber unit in inverse centimeters',
    aliases: [],
    type: 'length',
    factor: 1,
    base: UNITS._CM,
    min: 0,
    max: 1.79e308,
  },
];
