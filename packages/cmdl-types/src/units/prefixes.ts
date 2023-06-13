const giga = {
  symbol: 'G',
  aliases: ['Giga', 'giga'],
  factor: 1e9,
  type: 'prefix',
};
const mega = {
  symbol: 'M',
  aliases: ['Mega', 'mega'],
  factor: 1e6,
  type: 'prefix',
};
const kilo = {
  symbol: 'k',
  aliases: ['kilo'],
  factor: 1e3,
  type: 'prefix',
};
const hecto = {
  symbol: 'h',
  aliases: ['Hecto', 'hecto'],
  factor: 1e2,
  type: 'prefix',
};
const deca = {
  symbol: 'da',
  aliases: ['Deca', 'deca'],
  factor: 1e1,
  type: 'prefix',
};
const deci = {
  symbol: 'd',
  aliases: ['Deci', 'deci'],
  factor: 1e-1,
  type: 'prefix',
};
const centi = {
  symbol: 'c',
  aliases: ['Centi', 'centi'],
  factor: 1e-2,
  type: 'prefix',
};
const milli = {
  symbol: 'm',
  aliases: ['Milli', 'milli'],
  factor: 1e-3,
  type: 'prefix',
};
const micro = {
  symbol: 'mc',
  aliases: ['Micro', 'micro', 'u', 'µ', '\u03BC', '\u00B5'],
  factor: 1e-6,
  type: 'prefix',
};
const nano = {
  symbol: 'n',
  aliases: ['Nano', 'nano'],
  factor: 1e-9,
  type: 'prefix',
};
const pico = {
  symbol: 'n',
  aliases: ['Pico', 'pico'],
  factor: 1e-12,
  type: 'prefix',
};

export const prefixes = [
  giga,
  mega,
  kilo,
  hecto,
  deca,
  deci,
  centi,
  milli,
  micro,
  nano,
  pico,
];
