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
    let nodeDP = this.properties.get("degree_poly");
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
    let nodeDP = this.properties.get("degree_poly");
    return `${mask};${this.smiles}${nodeDP ? `;${nodeDP.value}` : ""}`;
  }

  /**
   * Removes extraneous numbers in smiles fragments
   * @deprecated
   * @returns string
   */
  private sanitizeSmiles() {
    if (!this.smiles.length) {
      return "-";
    }
    const removeRegex = new RegExp(/:[1|2]/g);
    return this.smiles.replace(removeRegex, "");
  }

  /**
   * Exports node smiles string to BigSMILES format
   * @deprecated
   * @TODO update method as per edge cases
   * @returns string
   */
  public exportToBigSMILES(): string {
    if (!this.smiles.length) {
      return "";
    }

    const smiles = this.sanitizeSmiles();
    const attachmentPointRegex = new RegExp(/\[(?<point>[RQZX]{1})\]/g);
    const matches = smiles.match(attachmentPointRegex);

    if (!matches) {
      return this.sanitizeSmiles();
    }

    if (matches.length === 1) {
      const strippedSmiles = smiles.replace(attachmentPointRegex, "");
      return strippedSmiles;
    }

    if (matches.length > 2) {
      throw new Error(`Greater than two attachment points`);
    }

    if (matches[0] === matches[1]) {
      const equalSmiles = smiles.replace(attachmentPointRegex, `[$]`);
      return equalSmiles;
    } else {
      const newSmiles = smiles.replace(new RegExp(matches[0]), `<`);
      const finalSmiles = newSmiles.replace(new RegExp(matches[1]), `>`);
      return finalSmiles;
    }
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
}
