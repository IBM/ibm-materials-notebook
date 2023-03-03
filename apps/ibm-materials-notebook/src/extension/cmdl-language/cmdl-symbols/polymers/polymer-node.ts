import Big from "big.js";
import { PolymerComponent } from "./polymer-types";
import { Container } from "./polymer-tree-container";
import { PolymerTreeVisitor } from "./polymer-weights";
import { cmdlLogger } from "../../logger";

export interface EntityConfig {
  fragment: string;
  mw: Big;
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
  mw: Big;
  smiles: string;
  properties = new Map<string, any>(); //dp, mol_fraction, etc.
  parent: Container | null = null;

  constructor({ fragment, mw, smiles }: EntityConfig) {
    this.fragment = fragment;
    this.mw = mw;
    this.smiles = smiles || "-";
  }

  isContainer(): boolean {
    return false;
  }

  setParent(arg: Container): void {
    this.parent = arg;
  }

  toJSON() {
    const entityRecord: Record<string, any> = {
      name: this.name,
      mw: this.mw.toNumber(),
      smiles: this.smiles,
      parent: this.parent?.name || null,
    };

    for (const [key, value] of this.properties.entries()) {
      entityRecord[key] = value;
    }

    return entityRecord;
  }

  public setName() {
    if (!this.parent) {
      throw new Error(`detached node ${this.fragment}`);
    }

    const path = this.parent.getPath([]);
    this.group = path.join(".");
    this.name = `${path.join(".")}.${this.fragment}`;
  }

  public getDegreePoly() {
    let nodeDP = this.properties.get("degree_poly");
    if (!nodeDP) {
      return 1;
    } else {
      return Number(nodeDP.value);
    }
  }

  /**
   * Serializes to string format for export
   * @returns string
   */
  public toString() {
    const smiles = this.sanitizeSmiles();
    let base = `<name>${this.name}<mw>${this.mw.toNumber()}<smiles>${smiles}`;

    for (const [key, value] of this.properties.entries()) {
      base = `${base}<${key}>${value?.value || value}`;
    }

    return base;
  }

  /**
   * Serializes to more concise format by masking absolute paths
   * @param mask string
   * @returns string
   */
  public toMaskedString(mask: string) {
    const smiles = this.sanitizeSmiles();
    return `<name>${mask}<mw>${this.mw.toNumber()}<smiles>${smiles}`;
  }

  /**
   * Serializes polymer node into a more compressed string format
   * @param mask string
   * @returns string
   */
  public toCompressedString(mask: string) {
    const smiles = this.sanitizeSmiles();
    return `${mask}|${smiles}`;
  }

  public getSmiles() {
    return this.sanitizeSmiles();
  }

  /**
   * Removes extraneous numbers in smiles fragments
   * @returns string
   */
  private sanitizeSmiles() {
    if (!this.smiles.length) {
      return "-";
    }
    const removeRegex = new RegExp(/:[1|2]/g);
    return this.smiles.replace(removeRegex, "");
  }

  exportToBigSMILES(): string {
    if (!this.smiles.length) {
      return "";
    }

    const smiles = this.sanitizeSmiles();
    const attachmentPointRegex = new RegExp(/\[(?<point>[RQZX]{1})\]/g);
    const matches = smiles.match(attachmentPointRegex);

    if (!matches) {
      cmdlLogger.silly(`No matches found`);
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

  print() {
    return `entity: ${this.name}, mw: ${this.mw.toNumber()}, smiles: ${
      this.smiles
    };\n`;
  }

  accept(visitor: PolymerTreeVisitor): void {}
}
