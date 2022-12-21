import { IUnit, UNITS } from './unit-types';

export const mw_cm2: IUnit = {
  symbol: UNITS.MW_CM2,
  regex: /mW\/cm\^2/,
  aliases: [],
  detail: 'milliwatts per cm2',
  description: 'power area units in mW/cm^2',
  type: 'concentration',
  base: UNITS.MW_CM2,
  factor: 1,
  min: 0,
  max: 1.79e308,
};
