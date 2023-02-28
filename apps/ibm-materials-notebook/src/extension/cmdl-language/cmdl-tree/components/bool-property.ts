import { AstVisitor, SymbolTableBuilder } from "../../cmdl-symbols";
import { CmdlToken } from "../../composite-tree-visitor";
import { Property } from "./base-components";
import { ModelVisitor } from "../../cmdl-symbols";
import { InvalidPropertyError } from "../../errors";
import { PropertyTypes } from "../../cmdl-types";

/**
 * Handles boolean properties in CMDL Record trees
 */
export class BoolProperty extends Property {
  protected value: string = "";
  protected valueToken?: CmdlToken;

  constructor(token: CmdlToken) {
    super(token);
  }

  setValue(val: string, token: CmdlToken) {
    this.value = val;
    this.valueToken = token;
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();

    if (this.propertyType?.type !== PropertyTypes.BOOLEAN) {
      let msg = `Invalid property type for ${this.name}`;
      let err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
    }

    return this.errors;
  }

  getValues() {
    return this.value;
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitProperty(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitProperty(this);
    }
  }
}
