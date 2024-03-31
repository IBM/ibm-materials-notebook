import { ModelVisitor } from "../intepreter";
import { AstVisitor } from "../symbols";
import { CMDLError } from "../errors/errors";
import { CMDLNode } from "./nodes";

/**
 * Represents a condensed AST for validation and interpretation (execution of models) of CMDL
 * TODO: merge with CMDL AST
 * TODO: implement printable interface
 */
export class CmdlTree {
  private root: CMDLNode;
  /**
   * @deprecated
   */
  private children: CMDLNode[] = [];

  constructor(root: CMDLNode) {
    this.root = root;
  }

  /**
   * Method to add a component to the CMDL tree
   * @deprecated
   * @param component CMDLNode
   */
  public add(component: CMDLNode): void {
    this.children.push(component);
  }

  /**
   * Method for determining whether node in tree has children
   * @deprecated
   * @returns boolean
   */
  public isComposite(): boolean {
    return true;
  }

  /**
   * Method for validating CMDL tree, returns an array of errors
   * @deprecated
   * @returns BaseError[]
   */
  public validate(): CMDLError[] {
    // for (const child of this.children) {
    //   const childErrors = child.doValidation();
    //   this.errors = this.errors.concat(childErrors);
    // }
    return [];
  }

  /**
   * Iterate over CMDLTree with a visitor
   * @param visitor AstVisitor
   */
  public visit(visitor: AstVisitor): void {
    for (const child of this.children) {
      visitor.visit(child);
    }
  }

  /**
   * Interprets CMDL tree and computes output
   * @deprecated
   * @param visitor ModelVisitor
   */
  public evaluate(visitor: ModelVisitor): void {
    for (const child of this.children) {
      visitor.visit(child);
    }
  }

  /**
   * Constructs symbol table from CMDL ast
   * @deprecated
   * @param builder AstVisitor
   */
  public createSymbolTable(builder: AstVisitor): void {
    for (const child of this.children) {
      builder.visit(child);
    }
  }

  public findByImage(image: string) {
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
    const childrenStr = this.children.map((el) => el.print());

    return `CMDL AST\n-------------\nNode: ROOT\nChildren:${this.children.length}\n---------------\n${childrenStr}`;
  }
}
