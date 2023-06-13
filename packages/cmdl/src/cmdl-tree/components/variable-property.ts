import { CmdlToken } from "../../cmdl-types";
import { AstVisitor, SymbolTableBuilder } from "../../symbols";
import { Property } from "./base-components";
import { BaseError } from "../../errors";

/**
 * Handles variable properties with CMDL record trees
 */
export class VariableProperty extends Property {
  protected value: string = "";
  protected valueToken?: CmdlToken;

  constructor(token: CmdlToken) {
    super(token);
  }

  /**
   * Sets token and value of the variable property
   * @param val string
   * @param token CmdlToken
   */
  public setValue(val: string, token: CmdlToken) {
    this.value = val;
    this.valueToken = token;
  }

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();
    return this.errors;
  }

  public getValues(): string {
    return this.value;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitVariableProperty(this);
    }
  }
}
