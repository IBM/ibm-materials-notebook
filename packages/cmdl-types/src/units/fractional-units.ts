import { IUnit, UNITS } from './unit-types';

export const percentage: IUnit = {
  symbol: UNITS.PERCENT,
  regex: new RegExp(UNITS.PERCENT),
  detail: 'percent',
  description: 'percentages',
  aliases: ['percent'],
  type: 'fractional',
  base: UNITS.PERCENT,
  factor: 1,
  min: 0,
  max: 100,
};

export const wt_percent: IUnit = {
  symbol: UNITS.WT_PERCENT,
  regex: new RegExp(UNITS.WT_PERCENT),
  detail: 'weight percent',
  description: 'weight percent',
  aliases: ['weight_percent', 'wt_percent'],
  type: 'fractional',
  base: UNITS.WT_PERCENT,
  factor: 1,
  min: 0,
  max: 100,
};

export const mol_percent: IUnit = {
  symbol: UNITS.MOL_PERCENT,
  regex: new RegExp(UNITS.MOL_PERCENT),
  detail: 'mol percent',
  description: 'mol percent',
  aliases: ['mol_percent'],
  type: 'fractional',
  base: UNITS.MOL_PERCENT,
  factor: 1,
  min: 0,
  max: 100,
};

export const mol_fraction: IUnit = {
  symbol: UNITS.MOL_FRACTION,
  regex: new RegExp(UNITS.MOL_FRACTION),
  detail: 'mol fraction',
  description: 'mol fraction',
  aliases: ['mol_fraction'],
  type: 'fractional',
  base: UNITS.MOL_FRACTION,
  factor: 1,
  min: 0,
  max: 1,
};

export const fractionalUnits = [
  mol_fraction,
  mol_percent,
  percentage,
  wt_percent,
];
