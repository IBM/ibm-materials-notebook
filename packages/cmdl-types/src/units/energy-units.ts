import { IUnit, UNITS } from './unit-types';

export const energyUnits: IUnit[] = [
  {
    symbol: UNITS.GJ,
    regex: new RegExp(UNITS.GJ),
    detail: 'gigajoule',
    description: 'energy units in gigajoules',
    aliases: ['Gigajoule', 'gigajoule'],
    factor: 1e9,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.M_J,
    regex: new RegExp(UNITS.M_J),
    detail: 'megajoule',
    description: 'energy units in megajoules',
    aliases: ['Megajoule', 'megajoule'],
    factor: 1e6,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.KJ,
    regex: new RegExp(UNITS.KJ),
    detail: 'kilojoule',
    description: 'energy units in kilojoules',
    aliases: ['kilojoule'],
    factor: 1e3,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.HJ,
    regex: new RegExp(UNITS.HJ),
    detail: 'hectojoule',
    description: 'energy units in hectojoules',
    aliases: ['Hectojoule', 'hectojoule'],
    factor: 1e2,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DAJ,
    regex: new RegExp(UNITS.DAJ),
    detail: 'decajoule',
    description: 'energy units in decajoules',
    aliases: ['Decajoule', 'decajoule'],
    factor: 1e1,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.J,
    regex: new RegExp(UNITS.J),
    detail: 'decajoule',
    description: 'energy units in joules',
    aliases: ['joule', 'joules'],
    type: 'energy',
    factor: 1,
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DJ,
    regex: new RegExp(UNITS.DJ),
    detail: 'decijoule',
    description: 'energy units in decijoules',
    aliases: ['Decijoule', 'decijoule'],
    factor: 1e-1,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.CJ,
    regex: new RegExp(UNITS.CJ),
    detail: 'centijoule',
    description: 'energy units in centijoules',
    aliases: ['Centijoule', 'centijoule'],
    factor: 1e-2,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MJ,
    regex: new RegExp(UNITS.MJ),
    detail: 'millijoule',
    description: 'energy units in millijoules',
    aliases: ['Millijoule', 'millijoule'],
    factor: 1e-3,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MCJ,
    regex: new RegExp(UNITS.CJ),
    detail: 'centijoule',
    description: 'energy units in centijoules',
    aliases: ['Microjoule', 'microjoule'],
    factor: 1e-6,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.NJ,
    regex: new RegExp(UNITS.NJ),
    detail: 'nanojoule',
    description: 'energy units in nanojoules',
    aliases: ['Nanojoule', 'nanojoule'],
    factor: 1e-9,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.PJ,
    regex: new RegExp(UNITS.PJ),
    detail: 'picojoule',
    description: 'energy units in picojoules',
    aliases: ['Picojoule', 'picojoule'],
    factor: 1e-12,
    type: 'energy',
    base: UNITS.J,
    min: 0,
    max: 1.79e308,
  },
];