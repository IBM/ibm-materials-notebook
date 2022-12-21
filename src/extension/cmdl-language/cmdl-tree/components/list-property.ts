import { CmdlToken } from "../../composite-tree-visitor";
import { BaseError, InvalidPropertyError } from "../../errors";
import { parseStringImage } from "../utils";
import { Property } from "./base-components";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";

/**
 * Handles list properties in CMDL record trees
 */
export class ListProperty extends Property {
  protected value: string[] = [];
  protected valueToken?: CmdlToken[];

  constructor(token: CmdlToken) {
    super(token);
  }

  setValue(val: string[], token: CmdlToken[]) {
    this.value = val.map(parseStringImage);
    this.valueToken = token;
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();
    this.validateList();

    return this.errors;
  }

  private validateList() {
    let msg: string;
    let err: BaseError;

    if (!this.propertyType) {
      return;
    }

    if (!this.propertyType.categorical_values) {
      msg = `${this.name} is not a list property`;
      err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    if (!this.valueToken) {
      msg = `${this.name} does not have a value token`;
      err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    let counter = 0;
    for (const item of this.value) {
      if (!this.propertyType.categorical_values.includes(item)) {
        msg = `${item} is not an acceptable value for ${this.name}`;
        err = new InvalidPropertyError(msg, this.valueToken[counter]);
        this.errors.push(err);
      }
      counter++;
    }
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
