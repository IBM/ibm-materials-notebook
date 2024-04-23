import { AstVisitor } from "../symbols";
import { ASTNode, CMDLRoot } from "./collections";

/**
 * Represents a condensed AST for validation and interpretation (execution of models) of CMDL
 */
export class CMDLAst {
  private root: ASTNode;

  constructor() {
    this.root = new CMDLRoot();
  }

  public getRoot(): CMDLRoot {
    return this.root;
  }

  /**
   * Iterate over CMDLTree with a visitor
   * @param visitor AstVisitor
   */
  public visit(visitor: AstVisitor): void {
    visitor.visit(this.root);
  }

  public findByImage() {
    throw new Error("Not implemented!");
  }

  public findClosestGroup() {
    throw new Error("Not Implemented!");
  }

  /**
   * Method for printing tree to console
   * @returns string
   */
  public print(): string {
    // const childrenStr = this.children.map((el) => el.print());

    return `CMDL AST\n-------------\n${this.root.print()}\n---------------\n`;
  }
}
