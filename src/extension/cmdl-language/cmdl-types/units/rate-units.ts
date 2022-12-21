import { IUnit, UNITS } from './unit-types';

export const degCmin: IUnit = {
  symbol: UNITS.DEGC_MIN,
  regex: /degC\/min/,
  detail: '° C per min',
  description: 'temperature rate unit in degrees centigrade per min',
  aliases: [],
  type: 'rate',
  base: UNITS.DEGC_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const degKmin: IUnit = {
  symbol: UNITS.DEGK_MIN,
  regex: /degK\/min/,
  detail: 'K per min',
  description: 'temperature rate unit in degrees kelvin per min',
  aliases: [],
  type: 'rate',
  base: UNITS.DEGK_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const kPaS: IUnit = {
  symbol: UNITS.KPA_S,
  regex: /kPa\/s/,
  detail: 'kPa per sec',
  description: 'pressure rate unit in kilopascals per sec',
  aliases: [],
  type: 'rate',
  base: UNITS.DEGK_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const radian_s: IUnit = {
  symbol: UNITS.RADIAN_S,
  regex: /rad\/s/,
  detail: 'radians per sec',
  description: 'rotation rate unit in radians per sec',
  aliases: [],
  type: 'rate',
  base: UNITS.RADIAN_S,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const rpm: IUnit = {
  symbol: UNITS.RPM,
  regex: new RegExp(UNITS.RPM),
  detail: 'radians per sec',
  description: 'rotation rate unit in radians per sec',
  aliases: [],
  type: 'rate',
  base: UNITS.RADIAN_S,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const mclmin: IUnit = {
  symbol: UNITS.MCL_MIN,
  regex: /mcl\/min/,
  detail: 'microliter per min',
  description: 'rate unit in microliter per min',
  aliases: [],
  type: 'rate',
  base: UNITS.MCL_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const nlmin: IUnit = {
  symbol: UNITS.NL_MIN,
  regex: /nl\/min/,
  detail: 'nanoliter per min',
  description: 'rate unit in nanoliter per min',
  aliases: [],
  type: 'rate',
  base: UNITS.NL_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const mlmin: IUnit = {
  symbol: UNITS.ML_MIN,
  regex: /ml\/min/,
  detail: 'milliliter per min',
  description: 'rate unit in milliliter per min',
  aliases: [],
  type: 'rate',
  base: UNITS.ML_MIN,
  factor: 1,
  min: 0,
  max: 1.79e308,
};

export const rateUnits = [
  degCmin,
  degKmin,
  kPaS,
  radian_s,
  nlmin,
  mclmin,
  mlmin,
];
