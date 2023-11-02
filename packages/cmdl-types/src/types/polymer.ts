import { Reference, BaseModel, StripType } from "./reference";
import { PROPERTIES } from "../properties";
import { BigQty, Export, StringQtyUnitless } from "./quantities";
import { ModelType } from "../groups/group-types";

/**
 * Polymer representation parsed from CMDL
 */
export interface Polymer extends BaseModel {
  type: ModelType.POLYMER;
  [PROPERTIES.MN_AVG]?: BigQty;
  [PROPERTIES.MW_AVG]?: BigQty;
  [PROPERTIES.DISPERSITY]?: StringQtyUnitless;
  [PROPERTIES.STRUCTURE]?: Reference; //polymer graph representation reference
}

export type PolymerExport = StripType<Export<Polymer>> & {
  [PROPERTIES.SMILES]?: string;
  graph_string?: string;
};
export type PolymerRender = Export<Polymer> & {
  [PROPERTIES.SMILES]?: string;
  graph_string?: string;
};

/**
 * Values assigned to nodes in polymer graph
 */
export type PolymerTreeValue = {
  name: string;
  path: string[];
  [PROPERTIES.DEGREE_POLY]: StringQtyUnitless;
};

export type PolymerGraph = {
  name: string;
  type: ModelType.POLYMER_GRAPH;
  smiles: string;
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
