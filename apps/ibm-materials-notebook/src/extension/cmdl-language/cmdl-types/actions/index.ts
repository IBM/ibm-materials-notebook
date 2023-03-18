import { actionsAF } from "./actions-A-F";
import { actionsGZ } from "./actions-G-Z";
export { ACTIONS, IAction } from "./action-types";
export const allActions = [...actionsAF, ...actionsGZ];
