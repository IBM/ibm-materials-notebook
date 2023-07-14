import { CmdlToken } from "../cmdl-ast";
import { BaseError, RefError } from "../errors";
import { RecordNode } from "./base-components";
import { parseStringImage } from "./utils";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";

/**
 * Component AST node for handling import operations
 */
export class ImportOp implements RecordNode {
  name: string;
  nameToken: CmdlToken;
  alias?: string;
  aliasToken?: CmdlToken;
  parent: RecordNode | null = null;
  errors: BaseError[] = [];
  source: string;
  sourceToken: CmdlToken;

  constructor(token: CmdlToken, sourceToken: CmdlToken, alias?: CmdlToken) {
    this.name = token.image;
    this.source = parseStringImage(sourceToken.image);
    this.sourceToken = sourceToken;
    this.nameToken = token;
    if (alias) {
      this.aliasToken = alias;
      this.alias = parseStringImage(alias.image);
    }
  }

  public setParent(arg: RecordNode): void {
    this.parent = arg;
  }

  // ? Set module reference -> have symbol compiler parse and resolve imports/export
  public doValidation(): BaseError[] {
    let msg: string;
    let err: BaseError;

    if (!this.source || !this.name) {
      let msg = `Invalid import operation, source or name is invalid`;
      let err = new RefError(msg, this.nameToken);
      this.errors.push(err);
    }

    return this.errors;
  }

  public print(): string {
    return `
      name: ${this.name},
      source: ${this.source},
    `;
  }

  /**
   * Exports data of imported entity
   * @returns Record<string, any>
   */
  public export(): Record<string, any> {
    return {
      name: this.name,
      alias: this.aliasToken?.image || null,
      source: this.source,
    };
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitImportOp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitImportOp(this);
    }
  }
}

export class ImportFileOp implements RecordNode {
  name: string;
  nameToken: CmdlToken;
  parent: RecordNode | null = null;
  errors: BaseError[] = [];
  source: string;
  sourceToken: CmdlToken;

  constructor(token: CmdlToken, sourceToken: CmdlToken) {
    this.name = token.image;
    this.source = parseStringImage(sourceToken.image);
    this.sourceToken = sourceToken;
    this.nameToken = token;
  }

  public setParent(arg: RecordNode): void {
    this.parent = arg;
  }

  public doValidation(): BaseError[] {
    let msg: string;
    let err: BaseError;

    if (!this.source || !this.name) {
      let msg = `Invalid import operation, source or name is invalid`;
      let err = new RefError(msg, this.nameToken);
      this.errors.push(err);
    }

    return this.errors;
  }

  public print(): string {
    return `
      name: ${this.name},
      source: ${this.source},
    `;
  }

  /**
   * Exports data of imported entity
   * @returns Record<string, any>
   */
  public export(): Record<string, any> {
    return {
      name: this.name,
      source: this.source,
    };
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitImportFileOp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitImportFileOp(this);
    }
  }
}
