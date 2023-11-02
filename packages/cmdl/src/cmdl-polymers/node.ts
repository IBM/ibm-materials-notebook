import { PolymerComponent } from "./types";
import { Container } from "./tree-container";
import { PolymerTreeVisitor } from "./polymer-visitors";

export interface EntityConfig {
  fragment: string;
  smiles: string;
}

/**
 * Represents a discrete structural entity within a polymer tree
 * Contains specific data on a particular entity including properties, mw, and smiles.
 */
export class PolymerNode implements PolymerComponent {
  name: string = "";
  group: string = "";
  fragment: string;
  smiles: string;
  properties = new Map<string, any>(); //dp, mol_fraction, etc.
  parent: Container | null = null;

  constructor(fragment: string, smiles: string) {
    this.fragment = fragment;
    this.smiles = smiles || "-";
  }

  public isContainer(): boolean {
    return false;
  }

  public setParent(arg: Container): void {
    this.parent = arg;
  }

  /**
   * Sets full name for the polymer node
   */
  public setName(): void {
    if (!this.parent) {
      throw new Error(`detached node ${this.fragment}`);
    }

    const path = this.parent.getPath([]);
    this.group = path.join(".");
    this.name = `${path.join(".")}.${this.fragment}`;
  }

  /**
   * Retrieves the degree of polymerization for the node
   * @returns number
   */
  public getDegreePoly(): number {
    const nodeDP = this.properties.get("degree_poly");
    if (!nodeDP) {
      return 1;
    } else {
      return Number(nodeDP.value);
    }
  }

  /**
   * Serializes polymer node into a more compressed string format
   * @param mask string
   * @returns string
   */
  public toCompressedString(mask: string): string {
    const nodeDP = this.properties.get("degree_poly");
    return `${mask};${this.smiles}${nodeDP ? `;${nodeDP.value}` : ""}`;
  }

  /**
   * Serialized the polymer node to a string for printing to the console
   * @returns string
   */
  public print(): string {
    return `name: ${this.name}, smiles: ${this.smiles};\n`;
  }

  /**
   * Accepts a polymer tree visitor for polymer weight computations
   * @param visitor PolymerTreeVisitor
   */
  public accept(visitor: PolymerTreeVisitor): void {}

  public clone(): PolymerNode {
    const node = new PolymerNode(this.fragment, this.smiles);
    node.name = this.name;
    const nodeDp = this.properties.get("degree_poly");
    if (nodeDp) {
      node.properties.set("degree_poly", nodeDp);
    }
    return node;
  }
}
