import { logger } from "../logger";
import { ModelVisitor } from "../intepreter";
import { AstVisitor } from "../symbols";
import { BaseError } from "../errors";
import { RecordNode } from "./base-components";

/**
 * Represents a condensed AST for validation and interpretation (execution of models) of CMDL
 */
export class CmdlTree {
  name = "CmdlTree";
  private children: RecordNode[] = [];
  errors: BaseError[] = [];

  /**
   * Method to add a component to the CMDL tree
   * @param component RecordNode
   */
  public add(component: RecordNode): void {
    this.children.push(component);
    component.setParent(this);
  }

  /**
   * Method for determining whether node in tree has children
   * @returns boolean
   */
  public isComposite(): boolean {
    return true;
  }

  /**
   * Method for validating CMDL tree, returns an array of errors
   * @returns Promise<BaseError[]>
   */
  public async validate(): Promise<BaseError[]> {
    for (const child of this.children) {
      let childErrors = await child.doValidation();
      this.errors = this.errors.concat(childErrors);
    }
    return this.errors;
  }

  /**
   * Interprets CMDL tree and computes output
   * @param visitor ModelVisitor
   */
  public evaluate(visitor: ModelVisitor): void {
    for (const child of this.children) {
      visitor.visit(child);
    }
  }

  /**
   * Constructs symbol table from CMDL ast
   * @param builder AstVisitor
   */
  public createSymbolTable(builder: AstVisitor): void {
    logger.info("building symbol table...");
    for (const child of this.children) {
      builder.visit(child);
    }
  }

  /**
   * Method for printing tree to console
   * TODO: have return string instead of object
   * @returns any
   */
  public print() {
    return {
      name: "RECORD",
      children: this.children.map((el) => el.print()),
    };
  }
}
