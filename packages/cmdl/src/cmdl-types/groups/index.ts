import { characterizationGroups } from "./characterization-groups";
import { chemicalGroups } from "./chemical-groups";
import { exprimentGroups } from "./experiment-groups";
import { structureGroups } from "./structure-groups";
import { refGroups } from "./reference-groups";
import { GROUPS, IGroup } from "./group-types";
import { GroupTypes } from "./group-types";

const allGroups = [
  ...characterizationGroups,
  ...chemicalGroups,
  ...exprimentGroups,
  ...structureGroups,
  ...refGroups,
];

export { GROUPS, IGroup, GroupTypes, allGroups };
