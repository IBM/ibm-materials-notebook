import { IUnit, UNITS } from './unit-types';

export const molUnits: IUnit[] = [
  {
    symbol: UNITS.GMOL,
    regex: new RegExp(UNITS.GMOL),
    detail: 'gigamoles',
    description: 'mole unit in gigamoles',
    aliases: ['Gigamol', 'gigamol'],
    factor: 1e9,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.M_MOL,
    regex: new RegExp(UNITS.M_MOL),
    detail: 'megamoles',
    description: 'mole unit in megamoles',
    aliases: ['Megamol', 'megamol'],
    factor: 1e6,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.KMOL,
    regex: new RegExp(UNITS.KMOL),
    detail: 'kilomoles',
    description: 'mole unit in kilomoles',
    aliases: ['kilomol'],
    factor: 1e3,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.HMOL,
    regex: new RegExp(UNITS.HMOL),
    detail: 'hectomoles',
    description: 'mole unit in hectomoles',
    aliases: ['Hectomol', 'hectomol'],
    factor: 1e2,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DAMOL,
    regex: new RegExp(UNITS.DAMOL),
    detail: 'hectomoles',
    description: 'mole unit in hectomoles',
    aliases: ['Decamol', 'decamol'],
    factor: 1e1,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MOL,
    regex: new RegExp(UNITS.MOL),
    detail: 'moles',
    description: 'mole unit in moles',
    aliases: ['mol', 'mols'],
    type: 'substance',
    factor: 1,
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.DMOL,
    regex: new RegExp(UNITS.DMOL),
    detail: 'decimoles',
    description: 'mole unit in decimoles',
    aliases: ['Decimol', 'decimol'],
    factor: 1e-1,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.CMOL,
    regex: new RegExp(UNITS.CMOL),
    detail: 'centimoles',
    description: 'mole unit in centimoles',
    aliases: ['Centimol', 'centimol'],
    factor: 1e-2,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MMOL,
    regex: new RegExp(UNITS.MMOL),
    detail: 'millimoles',
    description: 'mole unit in millimoles',
    aliases: ['Millimol', 'millimol'],
    factor: 1e-3,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.MCMOL,
    regex: new RegExp(UNITS.MCMOL),
    detail: 'micromoles',
    description: 'mole unit in micromoles',
    aliases: ['Micromol', 'micromol'],
    factor: 1e-6,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.NMOL,
    regex: new RegExp(UNITS.NMOL),
    detail: 'nanomoles',
    description: 'mole unit in nanomoles',
    aliases: ['Nanomol', 'nanomol'],
    factor: 1e-9,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
  {
    symbol: UNITS.PMOL,
    regex: new RegExp(UNITS.PMOL),
    detail: 'picomoles',
    description: 'mole unit in picomoles',
    aliases: ['Picomol', 'picomol'],
    factor: 1e-12,
    type: 'substance',
    base: UNITS.MOL,
    min: 0,
    max: 1.79e308,
  },
];
