import { Reference, ChemStates } from "./reference";
import { PROPERTIES } from "../properties";
import { BigQty, StringQtyUnitless } from "./quantities";
import { ModelType } from "../groups/group-types";

/**
 * Polymer representation parsed from CMDL
 */
export type Polymer = {
  name: string;
  type: ModelType.POLYMER;
  [PROPERTIES.MN_AVG]?: BigQty;
  [PROPERTIES.BIG_SMILES]?: string;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.MW_AVG]?: BigQty;
  [PROPERTIES.DISPERSITY]?: StringQtyUnitless;
  [PROPERTIES.STATE]: ChemStates;
  [PROPERTIES.TREE]?: any; //polymer graph representation reference
};

/**
 * Values assigned to nodes in polymer graph
 */
export type PolymerTreeValue = {
  name: string;
  path: string[];
  [PROPERTIES.DEGREE_POLY]: StringQtyUnitless;
};

/**
 * Polymer graph representation written to Model AR
 */
export type PolymerGraph = {
  name: string;
  type: ModelType.POLYMER_GRAPH;
  graph: any;
  tree: any;
  str: string;
};

export interface PolymerConnection {
  sources: Reference[];
  targets: Reference[];
  quantity: string;
}

export interface PolymerContainer {
  name: string;
  nodes: Reference[];
  type: string;
  connections?: PolymerConnection[];
  containers?: PolymerContainer[];
  parent?: string;
}
