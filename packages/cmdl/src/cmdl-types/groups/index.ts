import { characterizationGroups } from "./characterization-groups";
import { experimentGroups } from "./experiment-groups";
import { structureGroups } from "./structure-groups";
import { refGroups } from "./reference-groups";
export { GROUPS, IGroup, ModelType } from "./group-types";

export const allGroups = [
  ...characterizationGroups,
  ...experimentGroups,
  ...structureGroups,
  ...refGroups,
];
