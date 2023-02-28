import { CmdlToken } from "../../composite-tree-visitor";
import { Property } from "./base-components";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";
import { SymbolReference } from "./reference-group";

/**
 * Represents individual references within a reference list property
 */
export class ReferenceValue extends Property implements SymbolReference {
  path: CmdlToken[];

  constructor(token: CmdlToken, path: CmdlToken[]) {
    super(token);
    this.path = path;
  }

  getValues() {
    return this.name;
  }

  getPath(): string[] {
    return this.path.map((el) => el.image);
  }

  print() {
    return {
      name: this.name,
      path: this.getPath(),
    };
  }

  export() {
    return {
      ref: this.name,
      path: this.path.map((el) => el.image),
    };
  }

  accept(visitor: AstVisitor): void {
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

  public addReference(idToken: CmdlToken, pathTokens: CmdlToken[] = []) {
    const refValue = new ReferenceValue(idToken, pathTokens);
    this.value.push(refValue);
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();

    return this.errors;
  }

  public getValues() {
    return this.value;
  }

  public export() {
    return this.value.map((el) => el.export());
  }

  public print() {
    return {
      name: this.name,
      value: this.value.map((el) => el.print()),
      parent: this.parent?.name,
    };
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitRefListProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitReferenceListProperty(this);
    }
  }
}
