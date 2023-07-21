import { PolymerTreeVisitor } from "./polymer-visitors";

export interface Serializable {
  /**
   * Converts to string for logging purposes
   */
  print(): string;
}

/**
 * Interface for defining components within the polymer tree
 */
export interface PolymerComponent extends Serializable {
  /**
   * Properties of the particular tree node eg. DP, mol fraction, etc.
   * @TODO improve typing for properties
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
