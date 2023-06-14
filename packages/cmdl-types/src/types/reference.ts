import { ModelType } from "../groups/group-types";

export interface Reference {
  ref: string;
  path: string[];
}

export interface BaseModel {
  name: string;
  type: ModelType;
}

export type NodeTree = {
  [i: string]: NodeTree;
};

export enum ChemStates {
  SOLID = "solid",
  LIQUID = "liquid",
  GAS = "gas",
}
