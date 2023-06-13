export { ModelType } from "./groups/group-types";
export { typeManager } from "./type-mananger";
export { UNITS } from "./units";
export { GROUPS, GroupTypes, IGroup } from "./groups";
export {
  PROPERTIES,
  PropertyTypes,
  ReactionRoles,
  IProperty,
} from "./properties";
export { TAGS } from "./tags";

export type CMDLNodeTree = {
  [i: string]: CMDLNodeTree;
};

export interface CMDLRef {
  ref: string;
  path: string[];
}

export type RefResult = {
  technique: string;
  source: string;
  property: string;
  value: any;
  name: string;
  path: string[];
};
