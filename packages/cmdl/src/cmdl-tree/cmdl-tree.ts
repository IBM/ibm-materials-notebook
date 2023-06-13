import { logger } from "../logger";
import { Library } from "../../library";
import { ModelVisitor } from "../symbols/models";
import { AstVisitor } from "../symbols/symbols/symbol-table";
import { BaseError } from "../errors";
import { RecordNode } from "./components/base-components";

/**
 * Represents a condensed AST for validation and interpretation (execution of models) of CMDL
 */
export class CmdlTree {
  name = "CmdlTree";
  private children: RecordNode[] = [];
  errors: BaseError[] = [];

  public add(component: RecordNode): void {
    this.children.push(component);
    component.setParent(this);
  }

  public isComposite(): boolean {
    return true;
  }

  public async validate(library?: Library) {
    for (const child of this.children) {
      let childErrors = await child.doValidation(library);
      this.errors = this.errors.concat(childErrors);
    }
    return this.errors;
  }

  public evaluate(visitor: ModelVisitor) {
    for (const child of this.children) {
      visitor.visit(child);
    }
  }

  public createSymbolTable(builder: AstVisitor) {
    logger.info("building symbol table...");
    for (const child of this.children) {
      builder.visit(child);
    }
  }

  public print() {
    return {
      name: "RECORD",
      children: this.children.map((el) => el.print()),
    };
  }
}
