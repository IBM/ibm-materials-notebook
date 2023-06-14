import { Reference, ChemStates } from "./reference";
import { PROPERTIES } from "../properties";
import { StringQty, StringQtyUnitless } from "./units";
import { ModelType } from "../groups/group-types";

/**
 * Polymer representation parsed from CMDL
 */
export type Polymer = {
  name: string;
  type: ModelType.POLYMER;
  [PROPERTIES.MN_AVG]: StringQty;
  [PROPERTIES.BIG_SMILES]?: string;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.MW_AVG]?: StringQty;
  [PROPERTIES.DISPERSITY]?: StringQtyUnitless;
  [PROPERTIES.STATE]: ChemStates;
  [PROPERTIES.TREE]: any; //polymer graph representation reference
};

export type PolymerTreeValue = {
  name: string;
  path: string[];
  [PROPERTIES.DEGREE_POLY]: StringQtyUnitless;
};

/**
 * Polymer graph representation parsed from CMDL?
 */
export type PolymerGraph = {
  name: string;
  type: ModelType.POLYMER_GRAPH;
  graph: any;
  tree: any;
  str: string;
  maskedStr: string;
  compressedStr: string;
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

export interface PolymerTree {
  name: string;
  nodes: Reference[];
  connections?: PolymerConnection[];
  containers?: PolymerContainer[];
  parent?: string;
}
