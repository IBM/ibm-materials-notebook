import { AstVisitor, SymbolTableBuilder } from "../../symbols";
import { CmdlToken } from "../../cmdl-parser-types";
import { Property } from "./base-components";
import { ModelVisitor } from "../../symbols";
import { BaseError, InvalidPropertyError } from "../../errors";
import { PropertyTypes } from "cmdl-types";

/**
 * Handles boolean properties in CMDL Record trees
 */
export class BoolProperty extends Property {
  protected value: string = "";
  protected valueToken?: CmdlToken;

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

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();

    if (this.propertyType?.type !== PropertyTypes.BOOLEAN) {
      let msg = `Invalid property type for ${this.name}`;
      let err = new InvalidPropertyError(msg, this.nameToken);
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