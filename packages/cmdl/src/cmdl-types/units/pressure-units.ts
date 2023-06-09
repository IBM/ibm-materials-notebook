import { IUnit, UNITS } from './unit-types';

const pascal: IUnit = {
  symbol: UNITS.PA,
  regex: new RegExp(UNITS.PA),
  detail: 'pascals',
  description: 'pressure unit in pascals',
  aliases: ['pascal', 'pascals'],
  type: 'pressure',
  factor: 1,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const kilopascal: IUnit = {
  symbol: UNITS.KPA,
  regex: new RegExp(UNITS.KPA),
  detail: 'kilopascals',
  description: 'pressure unit in kilopascals',
  aliases: ['kilopascal', 'kilopascals'],
  type: 'pressure',
  factor: 1e3,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const megapascal: IUnit = {
  symbol: UNITS.MPA,
  regex: new RegExp(UNITS.MPA),
  detail: 'megapascals',
  description: 'pressure unit in megapascals',
  aliases: ['megapascal', 'megapascals'],
  type: 'pressure',
  factor: 1e6,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const mbar: IUnit = {
  symbol: UNITS.MBAR,
  regex: new RegExp(UNITS.MBAR),
  detail: 'millibar',
  description: 'pressure unit in millibars',
  aliases: ['millibars', 'millibar'],
  type: 'pressure',
  factor: 1e8,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const bar: IUnit = {
  symbol: UNITS.BAR,
  regex: new RegExp(UNITS.BAR),
  detail: 'bar',
  description: 'pressure unit in bars',
  aliases: ['bars'],
  type: 'pressure',
  factor: 1e5,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const mmHg: IUnit = {
  symbol: UNITS.MMHG,
  regex: new RegExp(UNITS.MMHG),
  detail: 'millimeters Hg',
  description: 'pressure unit in mmHg',
  aliases: [],
  type: 'pressure',
  factor: 133.322368,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const torr: IUnit = {
  symbol: UNITS.TORR,
  regex: new RegExp(UNITS.MMHG),
  detail: 'torr',
  description: 'pressure unit in torr',
  aliases: [],
  type: 'pressure',
  factor: 133.322368,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const mtorr: IUnit = {
  symbol: UNITS.MTORR,
  regex: new RegExp(UNITS.MTORR),
  detail: 'millitorr',
  description: 'pressure unit in millitorr',
  aliases: ['millitorr'],
  type: 'pressure',
  factor: 133322.368,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const inHg: IUnit = {
  symbol: UNITS.INHG,
  regex: new RegExp(UNITS.INHG),
  detail: 'inches Hg',
  description: 'pressure unit in inches Hg',
  aliases: [],
  type: 'pressure',
  factor: 3386.3881472,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const atm: IUnit = {
  symbol: UNITS.ATM,
  regex: new RegExp(UNITS.ATM),
  detail: 'atmosphere',
  description: 'pressure unit in atmospheres',
  aliases: ['ATM', 'atmosphere', 'atmospheres'],
  type: 'pressure',
  factor: 101325,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const psi: IUnit = {
  symbol: UNITS.PSI,
  regex: new RegExp(UNITS.PSI),
  detail: 'pounds per sq. inch',
  description: 'pressure unit in psi',
  aliases: [],
  type: 'pressure',
  factor: 6894.76,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const cmh20: IUnit = {
  symbol: UNITS.CMH2O,
  regex: new RegExp(UNITS.CMH2O),
  detail: 'centimeters of water',
  description: 'pressure unit in centimeters of water',
  aliases: ['cmh20'],
  type: 'pressure',
  factor: 98.0638,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

const inh20: IUnit = {
  symbol: UNITS.INH2O,
  regex: new RegExp(UNITS.INH2O),
  detail: 'inches of water',
  description: 'pressure unit in inches of water',
  aliases: ['inh20'],
  type: 'pressure',
  factor: 249.082052,
  base: UNITS.PA,
  min: 0,
  max: 1.79e308,
};

export const pressureUnits = [
  kilopascal,
  pascal,
  megapascal,
  atm,
  mbar,
  bar,
  torr,
  mtorr,
  psi,
  mmHg,
  cmh20,
  inHg,
  inh20,
];
