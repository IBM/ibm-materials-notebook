import { CmdlToken } from "../cmdl-ast";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { Property } from "./base-components";
import { CMDLError } from "../errors";

/**
 * Handles variable properties with CMDL record trees
 * @deprecated replace with property assignments and pseudo-inheritance
 */
export class VariableProperty extends Property {
  protected value: string = "";

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

  public doValidation(): CMDLError[] {
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
