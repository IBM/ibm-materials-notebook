import { CmdlToken } from "../cmdl-ast";
import { CMDLError, InvalidPropertyError } from "../errors";
import { parseStringImage } from "./utils";
import { Property } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { PropertyTypes, TAGS } from "../cmdl-types";
import { ModelVisitor } from "../intepreter";

/**
 * Handles list properties in CMDL record trees
 * @deprecated
 */
export class ListProperty extends Property {
  protected value: string[] = [];
  protected valueToken?: CmdlToken[];

  constructor(token: CmdlToken) {
    super(token);
    this.valueToken = [];
  }

  /**
   * Sets value and token for the list property
   * @param val string[]
   * @param token CmdlToken[]
   */
  public setValue(val: string[], token: CmdlToken[]): void {
    this.value = val.map(parseStringImage);
    this.valueToken = token;
  }

  /**
   *
   * @deprecated move to validation visitor
   */
  public doValidation(): CMDLError[] {
    this.getPropertyType();
    this.validateProperty();
    this.validateList();

    return this.errors;
  }

  /**
   * Performs validation logic on list property
   * @deprecated move to validation visitor
   */
  private validateList(): void {
    let msg: string;
    let err: CMDLError;

    if (!this.propertyType) {
      return;
    }

    if (!this.valueToken) {
      msg = `${this.name} does not have a value token`;
      err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    if (this.propertyType.type === PropertyTypes.LIST) {
      return;
    }

    if (!this.propertyType.categorical_values) {
      msg = `${this.name} is not a valid categorical property`;
      err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    let counter = 0;
    for (const item of this.value) {
      if (!this.propertyType.categorical_values.includes(item as TAGS)) {
        msg = `${item} is not an acceptable value for ${this.name}`;
        err = new InvalidPropertyError(msg, this.valueToken[counter]);
        this.errors.push(err);
      }
      counter++;
    }
  }

  public getValues(): string[] {
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
