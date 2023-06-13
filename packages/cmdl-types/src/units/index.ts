import { lengthUnits } from './length-units';
import { massUnits } from './mass-units';
import { volumeUnits } from './volume-units';
import { molUnits } from './substance-units';
import { potentialUnits } from './potential-units';
import { energyUnits } from './energy-units';
import { fractionalUnits } from './fractional-units';
import { molWeightUnits } from './mol-weight-unit';
import { pressureUnits } from './pressure-units';
import { rateUnits } from './rate-units';
import { temperatureUnits } from './temperature-units';
import { timeUnits } from './time-units';
import { viscosityUnits } from './viscosity-units';
import { concentrationUnits } from './conentration-units';
import { powerUnits } from './power-units';
import { IUnit, UNITS } from './unit-types';

const allUnits = [
  ...lengthUnits,
  ...massUnits,
  ...volumeUnits,
  ...molUnits,
  ...potentialUnits,
  ...energyUnits,
  ...fractionalUnits,
  ...molWeightUnits,
  ...pressureUnits,
  ...rateUnits,
  ...temperatureUnits,
  ...timeUnits,
  ...viscosityUnits,
  ...concentrationUnits,
  ...powerUnits,
];

export { IUnit, UNITS, allUnits };
