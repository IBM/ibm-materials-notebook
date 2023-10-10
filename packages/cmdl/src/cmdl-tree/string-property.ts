import { CmdlToken } from "../cmdl-ast";
import { parseStringImage } from "./utils";
import { Property } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { PROPERTIES, PropertyTypes } from "@ibm-materials/cmdl-types";
import { BaseError, InvalidPropertyError } from "../errors";
import { BigSMILES } from "@ibm-materials/ts-bigsmiles";

/**
 * Handles and string and text properties within CMDL record trees
 */
export class StringProperty extends Property {
  protected value: string = "";

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

  public doValidation(): BaseError[] {
    this.getPropertyType();
    this.validateProperty();

    if (
      this.propertyType?.type !== PropertyTypes.TEXT &&
      this.propertyType?.type !== PropertyTypes.CATEGORICAL_SINGLE
    ) {
      const msg = `Invalid property type for ${this.name}`;
      const err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
    }

    if (this.name === PROPERTIES.BIG_SMILES) {
      try {
        const bigSmilesParser = new BigSMILES(this.value);
        bigSmilesParser.toString();
      } catch (error) {
        const msg = (error as Error).message;
        const err = new InvalidPropertyError(msg, this.nameToken);
        this.errors.push(err);
      }
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
