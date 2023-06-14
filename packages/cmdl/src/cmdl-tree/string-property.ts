import { CmdlToken } from "../cmdl-parser-types";
import { parseStringImage } from "./utils";
import { Property } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { PROPERTIES, PropertyTypes } from "cmdl-types";
import { BaseError, InvalidPropertyError } from "../errors";
import { BigSMILES } from "ts-bigsmiles";

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

    if (this.name === PROPERTIES.BIG_SMILES) {
      try {
        const bigSmilesParser = new BigSMILES(this.value);
        const validatedStr = bigSmilesParser.toString();
      } catch (error) {
        let msg = (error as Error).message;
        let err = new InvalidPropertyError(msg, this.nameToken);
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
