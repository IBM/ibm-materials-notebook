export interface IAction {
  description: string;
  detail: string;
  name: string;
  aliases: string[];
  properties: string[];
}

export enum ACTIONS {
  ADD = 'add',
  ANALYZE = 'analyze',

  CENTRIFUGE = 'centrifuge',
  CHROMATOGRAPH = 'chromatograph',
  COLLECT = 'collect',
  CONCENTRATE = 'concentrate',

  DEGAS = 'degas',
  DISTILL = 'distill',
  DIALYZE = 'dialyze',
  DRY = 'dry',

  EXTRACT = 'extract',

  FILTER = 'filter',

  IRRADIATE = 'irradiate',

  LYOPHYLIZE = 'lyophylize',

  MAKE_SOLUTION = 'make_solution',
  MICROWAVE = 'microwave',

  PRESSURIZE = 'pressurize',
  PURGE = 'purge',
  PRECIPITATE = 'precipitate',

  RECRYSTALLIZE = 'recrystallize',
  REFLUX = 'reflux',
  REPEAT = 'repeat',

  SET_PH = 'set_pH',
  SET_RATE = 'set_rate',
  SET_TEMPERATURE = 'set_temperature',
  SONICATE = 'sonicate',
  STIR = 'stir',

  TRITURATE = 'triturate',

  VENT = 'vent',

  WAIT = 'wait',
  WASH = 'wash',
}
