import { IAction, ACTIONS } from './action-types';

const add: IAction = {
  description: 'Add a chemical or solution',
  detail: 'Add',
  name: ACTIONS.ADD,
  aliases: [],
  properties: [],
};

const analyze: IAction = {
  description: 'Analyze reaction',
  detail: 'Analyze',
  name: ACTIONS.ANALYZE,
  aliases: [],
  properties: [],
};

const centrifuge: IAction = {
  description: 'Centrifuge',
  detail: 'Centrifuge',
  name: ACTIONS.CENTRIFUGE,
  aliases: [],
  properties: [],
};

const chromatograph: IAction = {
  description: 'Chromatograph',
  detail: 'Chromatograph',
  name: ACTIONS.CHROMATOGRAPH,
  aliases: [],
  properties: [],
};

const concentrate: IAction = {
  description: 'Concentrate',
  detail: 'Concentrate',
  name: ACTIONS.CONCENTRATE,
  aliases: [],
  properties: [],
};

const collect: IAction = {
  description: 'Collect',
  detail: 'Collect',
  name: ACTIONS.COLLECT,
  aliases: [],
  properties: [],
};

const degas: IAction = {
  description: 'Degas',
  detail: 'Degas',
  name: ACTIONS.DEGAS,
  aliases: [],
  properties: [],
};

const distill: IAction = {
  description: 'Distill',
  detail: 'Distill',
  name: ACTIONS.DISTILL,
  aliases: [],
  properties: [],
};

const dialyze: IAction = {
  description: 'Dialyze',
  detail: 'Dialyze',
  name: ACTIONS.DIALYZE,
  aliases: [],
  properties: [],
};

const dry: IAction = {
  description: 'Dry',
  detail: 'Dry',
  name: ACTIONS.DRY,
  aliases: [],
  properties: [],
};

const extract: IAction = {
  description: 'Extract',
  detail: 'Extract',
  name: ACTIONS.EXTRACT,
  aliases: [],
  properties: [],
};

const filter: IAction = {
  description: 'Filter',
  detail: 'Filter',
  name: ACTIONS.FILTER,
  aliases: [],
  properties: [],
};

const irradiate: IAction = {
  description: 'Irradiate',
  detail: 'Irradiate',
  name: ACTIONS.IRRADIATE,
  aliases: [],
  properties: [],
};

const lyophylize: IAction = {
  description: 'Lyophylize',
  detail: 'Lyophylize',
  name: ACTIONS.LYOPHYLIZE,
  aliases: [],
  properties: [],
};

export const actionsAF = [
  add,
  analyze,
  centrifuge,
  chromatograph,
  collect,
  concentrate,
  degas,
  distill,
  dialyze,
  dry,
  extract,
  filter,
  irradiate,
  lyophylize,
];
