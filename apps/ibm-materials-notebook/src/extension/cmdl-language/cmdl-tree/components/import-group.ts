import { CmdlToken } from "../../composite-tree-visitor";
import { BaseError, FileError, RefError } from "../../errors";
import { RecordNode } from "./base-components";
import { parseStringImage } from "../utils";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";
import { Library } from "../../../library";

/**
 * Component AST node for handling import operations
 * @TODO improve handling of import types and Typescript type definitions
 */
export class ImportOp implements RecordNode {
  name: string;
  nameToken: CmdlToken;
  aliasToken?: CmdlToken;
  parent: RecordNode | null = null;
  type: string | null = null;
  errors: BaseError[] = [];
  protected source: string;
  protected sourceToken: CmdlToken;
  protected sourceData?: Record<string, any>;

  constructor(token: CmdlToken, sourceToken: CmdlToken, alias?: CmdlToken) {
    this.name = token.image;
    this.source = parseStringImage(sourceToken.image);
    this.sourceToken = sourceToken;
    this.nameToken = token;
    this.aliasToken = alias;
  }

  public setParent(arg: RecordNode): void {
    this.parent = arg;
  }

  public async doValidation(library?: Library): Promise<BaseError[]> {
    let msg: string;
    let err: BaseError;

    if (this.source === "cmdl.lib") {
      if (!library) {
        throw new Error(`Library unavailable for importing values!`);
      }
      //check library
      const ref = library.getItem(this.name);

      if (!ref) {
        msg = `Unable to locate ${this.name} from library`;
        err = new FileError(msg, this.sourceToken);
        this.errors.push(err);
        return this.errors;
      }

      this.sourceData = ref;
      this.type = ref?.type ? ref.type : null;
    } else {
      throw new Error(`Invalid import source: ${this.source}!`);
    }

    if (!this.sourceData || !this.type) {
      msg = `Unsuccessful in importing ${this.name}`;
      err = new RefError(msg, this.nameToken);
      this.errors.push(err);
      return this.errors;
    }

    return this.errors;
  }

  public print(): Record<string, any> {
    return {
      name: this.name,
      source: this.source,
    };
  }

  /**
   * Gets type of entity imported
   * @returns string
   */
  public getImportType(): string {
    if (!this.type) {
      throw new Error(
        `No type or template information available for ${this.name}`
      );
    }

    return this.type;
  }

  /**
   * Exports data of imported entity
   * @returns Record<string, any>
   */
  public export(): Record<string, any> {
    if (!this.sourceData || !this.type) {
      throw new Error(
        `Import ${this.name} does not have source data available`
      );
    }

    return {
      name: this.name,
      alias: this.aliasToken?.image || null,
      ...this.sourceData,
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
