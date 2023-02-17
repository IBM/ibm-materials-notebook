import { PolymerTreeVisitor } from "./polymer-weights";

interface CMDLUnit {
  value: string;
  unit: string | null;
  uncertainty: string | null;
}

interface CMDLPolymerFragment {
  name: string;
  molecular_weight: CMDLUnit;
  smiles: string;
}

export interface CMDLRef {
  ref: string;
  path: string[];
}

export interface CMDLPolymerConnection {
  sources: CMDLRef[];
  targets: CMDLRef[];
  quantity: string;
}

export interface CMDLPolymerContainer {
  name: string;
  nodes: CMDLRef[];
  type: string;
  connections?: CMDLPolymerConnection[];
  containers?: CMDLPolymerContainer[];
  parent?: string;
}

export interface CMDLPolymerTree {
  name: string;
  nodes: CMDLRef[];
  connections?: CMDLPolymerConnection[];
  containers?: CMDLPolymerContainer[];
  parent?: string;
}

export interface Serializable {
  /**
   * Converts to string for logging purposes
   */
  print(): string;

  /**
   * Converts to object for export
   */
  toJSON(): any;
}

/**
 * Interface for defining components within the polymer tree
 */
export interface PolymerComponent extends Serializable {
  /**
   * Properties of the particular tree node eg. DP, mol fraction, etc.
   */
  properties: Map<string, any>;

  /**
   * Method to determine whether component is a container or entity
   */
  isContainer(): boolean;

  /**
   * Sets provided polymer component as the parent of component calling the method
   * @param arg PolymerComponent
   */
  setParent(arg: PolymerComponent): void;

  /**
   * Generates absolute path for the entity compenent and sets as name
   */
  setName(): void;

  /**
   * Parent component of the node
   */
  parent: PolymerComponent | null;

  /**
   * Name of the node
   */
  name: string;

  /**
   * Accepts a tree visitor for computation of weights
   * @param visitor TreeVisitor
   */
  accept(visitor: PolymerTreeVisitor): void;
}
