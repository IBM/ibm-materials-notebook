import { CmdlToken } from "../../composite-tree-visitor";
import { AstVisitor, SymbolTableBuilder } from "../../cmdl-symbols";
import { NamedGroup } from "./named-group";

/**
 * Handles variable groups within CMDL record trees
 */
export class VariableGroup extends NamedGroup {
  constructor(token: CmdlToken, idToken: CmdlToken) {
    super(token, idToken);
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitVariableGroup(this);
    }
  }
}
