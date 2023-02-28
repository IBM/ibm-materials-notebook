import { actionsAF } from './actions-A-F';
import { actionsGZ } from './actions-G-Z';
import { ACTIONS, IAction } from './action-types';

const allActions = [...actionsAF, ...actionsGZ];

export { ACTIONS, IAction, allActions };
