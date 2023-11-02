import { IUnit, UNITS } from './unit-types';

const milliSecond: IUnit = {
  symbol: UNITS.MS,
  regex: new RegExp(UNITS.MS),
  detail: 'milliseconds',
  description: 'time unit in milliseconds',
  aliases: ['msec', 'msecs', 'millisecond', 'milliseconds'],
  type: 'time',
  factor: 1e-3,
  base: UNITS.SEC,
  min: 0,
  max: 1.79e308,
};

const second: IUnit = {
  symbol: UNITS.SEC,
  regex: new RegExp(UNITS.SEC),
  detail: 'seconds',
  description: 'time unit in seconds',
  aliases: ['sec', 'secs', 'second', 'seconds'],
  type: 'time',
  factor: 1,
  base: UNITS.SEC,
  min: 0,
  max: 1.79e308,
};

const minute: IUnit = {
  symbol: UNITS.MIN,
  regex: new RegExp(UNITS.MIN),
  detail: 'minutes',
  description: 'time unit in minutes',
  aliases: ['mins', 'minute', 'minutes'],
  type: 'time',
  factor: 60,
  base: UNITS.SEC,
  min: 0,
  max: 1.79e308,
};

const hour: IUnit = {
  symbol: UNITS.HOUR,
  regex: new RegExp(UNITS.HOUR),
  detail: 'hours',
  description: 'time unit in hours',
  aliases: ['hr', 'hrs', 'hour', 'hours'],
  type: 'time',
  factor: 3600,
  base: UNITS.SEC,
  min: 0,
  max: 1.79e308,
};

const day: IUnit = {
  symbol: UNITS.DAY,
  regex: new RegExp(UNITS.DAY),
  detail: 'day',
  description: 'time unit in days',
  aliases: ['day', 'days'],
  type: 'time',
  factor: 86400,
  base: UNITS.SEC,
  min: 0,
  max: 1.79e308,
};

export const timeUnits = [milliSecond, second, minute, hour, day];
