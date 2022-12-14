import { IUnit, UNITS } from './unit-types';

export const powerUnits: IUnit[] = [
  {
    symbol: UNITS.GW,
    regex: new RegExp(UNITS.GW),
    detail: 'gigawatt',
    description: 'power units in gigawatts',
    aliases: ['Gigawatt', 'gigawatt'],
    factor: 1e9,
    type: 'power',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.M_W,
    regex: new RegExp(UNITS.M_W),
    detail: 'megawatt',
    description: 'energy units in megawatts',
    aliases: ['Megawatt', 'megawatt'],
    factor: 1e6,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.KW,
    regex: new RegExp(UNITS.KW),
    detail: 'kilowatt',
    description: 'energy units in kilowatts',
    aliases: ['kilowatt'],
    factor: 1e3,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.HW,
    regex: new RegExp(UNITS.HW),
    detail: 'hectowatt',
    description: 'energy units in hectowatts',
    aliases: ['Hectowatt', 'hectowatt'],
    factor: 1e2,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DAW,
    regex: new RegExp(UNITS.DAW),
    detail: 'decawatt',
    description: 'energy units in decawatts',
    aliases: ['Decawatt', 'decawatt'],
    factor: 1e1,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.W,
    regex: new RegExp(UNITS.W),
    detail: 'decawatt',
    description: 'energy units in watts',
    aliases: ['watt', 'watts'],
    type: 'energy',
    factor: 1,
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DW,
    regex: new RegExp(UNITS.DW),
    detail: 'deciwatt',
    description: 'energy units in deciwatts',
    aliases: ['Deciwatt', 'deciwatt'],
    factor: 1e-1,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.CW,
    regex: new RegExp(UNITS.CW),
    detail: 'centiwatt',
    description: 'energy units in centiwatts',
    aliases: ['Centiwatt', 'centiwatt'],
    factor: 1e-2,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MW,
    regex: new RegExp(UNITS.MW),
    detail: 'milliwatt',
    description: 'energy units in milliwatts',
    aliases: ['Milliwatt', 'milliwatt'],
    factor: 1e-3,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MCW,
    regex: new RegExp(UNITS.CW),
    detail: 'centiwatt',
    description: 'energy units in centiwatts',
    aliases: ['Microwatt', 'microwatt'],
    factor: 1e-6,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.NW,
    regex: new RegExp(UNITS.NW),
    detail: 'nanowatt',
    description: 'energy units in nanowatts',
    aliases: ['Nanowatt', 'nanowatt'],
    factor: 1e-9,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.PW,
    regex: new RegExp(UNITS.PW),
    detail: 'picowatt',
    description: 'energy units in picowatts',
    aliases: ['Picowatt', 'picowatt'],
    factor: 1e-12,
    type: 'energy',
    base: UNITS.W,
    min: 0,
    max: 1.79e308,
  },
];
