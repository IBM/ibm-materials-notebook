import { CmdlToken } from "../../composite-tree-visitor";
import { AstVisitor, SymbolTableBuilder } from "../../cmdl-symbols";
import { Property } from "./base-components";

/**
 * Handles variable properties with CMDL record trees
 */
export class VariableProperty extends Property {
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
    this.validateVariable();

    return this.errors;
  }

  private validateVariable() {}

  getValues() {
    return this.value;
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitVariableProperty(this);
    }
  }
}
