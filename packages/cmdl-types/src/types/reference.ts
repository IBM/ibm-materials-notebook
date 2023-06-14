export interface Reference {
  ref: string;
  path: string[];
}

export type NodeTree = {
  [i: string]: NodeTree;
};

export enum ChemStates {
  SOLID = "solid",
  LIQUID = "liquid",
  GAS = "gas",
}
