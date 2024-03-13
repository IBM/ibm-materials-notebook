import { ModelType } from "../groups/group-types";

export interface Reference {
  ref: string;
  path: string[];
}

/**
 * @deprecated remove model types
 */
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

export type StripType<T> = Omit<T, "type">;
