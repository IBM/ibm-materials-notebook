import { CmdlToken } from "../cmdl-ast";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { NamedGroup } from "./named-group";

/**
 * Handles variable groups within CMDL record trees
 */
export class VariableGroup extends NamedGroup {
  constructor(token: CmdlToken, idToken: CmdlToken) {
    super(token, idToken);
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitVariableGroup(this);
    }
  }
}
