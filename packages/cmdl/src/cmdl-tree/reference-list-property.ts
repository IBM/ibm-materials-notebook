import { CmdlToken } from "../cmdl-ast";
import { Property } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { SymbolReference } from "./reference-group";
import { BaseError } from "../errors";
import { TYPES } from "@ibm-materials/cmdl-types";

/**
 * Represents individual references within a reference list property
 */
export class ReferenceValue extends Property implements SymbolReference {
  path: CmdlToken[];

  constructor(token: CmdlToken, path: CmdlToken[]) {
    super(token);
    this.path = path;
  }

  /**
   * Returns the name of the current reference value
   * @returns string
   */
  public getValues(): string {
    return this.name;
  }

  /**
   * Returns the path of the current reference value
   * @returns string[]
   */
  public getPath(): string[] {
    return this.path.map((el) => el.image);
  }

  /**
   * Converts to an object for printing to the console
   * @returns Record<string, any>
   */
  public print(): string {
    return `
      name: ${this.name},
      path: ${this.getPath()},
    `;
  }

  /**
   * Export reference value as CMDL Reference
   * @returns TYPES.Reference
   */
  public export() {
    return {
      ref: this.name,
      path: this.path.map((el) => el.image),
    };
  }

  public accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
}

/**
 * Handles reference properties in CMDL RecordTrees
 */
export class RefListProperty extends Property {
  protected value: ReferenceValue[] = [];

  constructor(token: CmdlToken) {
    super(token);
  }

  /**
   * Adds a reference to the current reference list property
   * @param idToken CmdlToken
   * @param pathTokens CmdlToken[]
   */
  public addReference(idToken: CmdlToken, pathTokens: CmdlToken[] = []) {
    const refValue = new ReferenceValue(idToken, pathTokens);
    this.value.push(refValue);
  }

  public doValidation(): BaseError[] {
    this.getPropertyType();
    this.validateProperty();

    return this.errors;
  }

  public getValues(): ReferenceValue[] {
    return this.value;
  }

  /**
   * Exports the values of the reference list property
   * @returns TYPES.Reference[]
   */
  public export(): TYPES.Reference[] {
    return this.value.map((el) => el.export());
  }

  public print(): string {
    return `
      name: ${this.name},
      value: ${this.value.map((el) => el.print())},
      parent: ${this.parent?.name},
    `;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitRefListProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitReferenceListProperty(this);
    }
  }
}
