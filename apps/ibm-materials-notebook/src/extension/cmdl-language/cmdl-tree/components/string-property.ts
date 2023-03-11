import { CmdlToken } from "../../composite-tree-visitor";
import { parseStringImage } from "../utils";
import { Property } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../../cmdl-symbols";
import { ModelVisitor } from "../../cmdl-symbols";
import { PropertyTypes } from "../../cmdl-types";
import { BaseError, InvalidPropertyError } from "../../errors";

/**
 * Handles and string and text properties within CMDL record trees
 */
export class StringProperty extends Property {
  protected value: string = "";
  protected valueToken?: CmdlToken;

  constructor(token: CmdlToken) {
    super(token);
  }

  /**
   * Sets value and token of string property.
   * @param val string
   * @param token CmdlToken
   */
  public setValue(val: string, token: CmdlToken) {
    this.value = parseStringImage(val);
    this.valueToken = token;
  }

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();

    if (
      this.propertyType?.type !== PropertyTypes.TEXT &&
      this.propertyType?.type !== PropertyTypes.CATEGORICAL_SINGLE
    ) {
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
