import { characterizationGroups } from "./characterization-groups";
import { chemicalGroups } from "./chemical-groups";
import { exprimentGroups } from "./experiment-groups";
import { structureGroups } from "./structure-groups";
import { refGroups } from "./reference-groups";
export { GROUPS, IGroup, ModelType } from "./group-types";

export const allGroups = [
  ...characterizationGroups,
  ...chemicalGroups,
  ...exprimentGroups,
  ...structureGroups,
  ...refGroups,
];
