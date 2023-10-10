import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { CmdlToken } from "../cmdl-ast";
import { Property } from "./base-components";
import { ModelVisitor } from "../intepreter";
import { BaseError, InvalidPropertyError } from "../errors";
import { PropertyTypes } from "@ibm-materials/cmdl-types";

/**
 * Handles boolean properties in CMDL Record trees
 */
export class BoolProperty extends Property {
  protected value: string = "";

  constructor(token: CmdlToken) {
    super(token);
  }

  /**
   * Sets value and token for the boolean property
   * @param val string
   * @param token CmdlToken
   */
  public setValue(val: string, token: CmdlToken): void {
    this.value = val;
    this.valueToken = token;
  }

  public doValidation(): BaseError[] {
    this.getPropertyType();
    this.validateProperty();

    if (this.propertyType?.type !== PropertyTypes.BOOLEAN) {
      const msg = `Invalid property type for ${this.name}`;
      const err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
    }

    return this.errors;
  }

  public getValues(): string {
    return this.value;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitProperty(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitProperty(this);
    }
  }
}
