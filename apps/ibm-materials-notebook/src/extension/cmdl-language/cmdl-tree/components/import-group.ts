import { CmdlToken } from "../../composite-tree-visitor";
import { BaseError, FileError, RefError } from "../../errors";
import { RecordNode } from "./base-components";
import { importManager } from "../file-system";
import { parseStringImage } from "../utils";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";
import { Library } from "../../../library";
import { cmdlLogger as logger } from "../../logger";

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
  protected sourceData?: any;

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

  async doValidation(library?: Library) {
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
      //check file path
      const isValidFile = await importManager.fileExists(this.source);

      if (!isValidFile) {
        msg = `Unable to locate ${this.source}`;
        err = new FileError(msg, this.sourceToken);
        this.errors.push(err);
        return this.errors;
      }

      const sourceData = await this.importSymbolData(this.source);

      if (!sourceData[this.name]) {
        msg = `${this.source} does not contain ${this.name}`;
        err = new RefError(msg, this.sourceToken);
        this.errors.push(err);
        return this.errors;
      }

      this.sourceData = sourceData[this.name];
      this.type = this.sourceData?.type ? this.sourceData.type : null;
    }

    if (!this.sourceData || !this.type) {
      msg = `Unsuccessful in importing ${this.name}`;
      err = new RefError(msg, this.nameToken);
      this.errors.push(err);
      return this.errors;
    }

    return this.errors;
  }

  private async importSymbolData(source: string) {
    const file = await importManager.readFile(source);
    const contents = JSON.parse(file);
    return contents;
  }

  public print() {
    return {
      name: this.name,
      source: this.source,
    };
  }

  public getImportType() {
    if (!this.type) {
      throw new Error(
        `No type or template information available for ${this.name}`
      );
    }

    return this.type;
  }

  public export() {
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
