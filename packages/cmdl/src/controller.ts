import { ActivationRecordManager } from "./activation-record-manager";
import { DiagnosticManager, ErrorTable } from "./error-manager";
import { SymbolTableManager } from "./symbol-manager";
import {
  Text,
  TextDocument,
  NotebookDocument,
  Notebook,
  CMDLCell,
  Cell,
} from "./document";
import { Compiler } from "./compiler";
import { CmdlTree } from "./cmdl-tree";
import { SymbolTable, SymbolTableBuilder } from "./symbols";
import { logger } from "./logger";
import { BaseError } from "./errors";

type FileUpdate = {
  uri: string;
  fileName: string;
};

/**
 * Controls CMDL functions for a given workspace
 */
export class Controller {
  private readonly _compiler = new Compiler();
  private readonly _errors = new DiagnosticManager();
  private readonly _symbols = new SymbolTableManager();
  private readonly _results = new ActivationRecordManager();
  private readonly _documents = new Map<
    string,
    TextDocument | NotebookDocument
  >();

  private getNotebook(uri: string): NotebookDocument {
    const doc = this._documents.get(uri);

    if (!doc) {
      throw new Error(`Document ${uri} does not exist!`);
    }

    if (!(doc instanceof NotebookDocument)) {
      throw new Error(`Document ${uri} is not a notebook...`);
    }

    return doc;
  }

  public register(doc: Notebook | Text) {
    if (doc.uri.split(":")[0] === "vscode-notebook-cell") {
      return;
    }

    if (this._documents.has(doc.uri)) {
      logger.verbose(`${doc.fileName} already registered with controller`);
      return;
    }

    logger.notice(`Registering ${doc.fileName}\n\t-${doc.uri}`);
    const symbolTable = this._symbols.create(doc.fileName);
    const errTable = this._errors.create(doc.fileName);
    this._results.create(doc.fileName);

    if ("cells" in doc) {
      const parsedCells = this.parseNotebook(doc, symbolTable, errTable);
      const notebook = new NotebookDocument(doc, parsedCells);
      this._documents.set(notebook.uri, notebook);
    } else {
      const recordTree = this.parseDocument(doc, symbolTable, errTable);
      const document = new TextDocument(doc, doc.version, recordTree);
      this._documents.set(doc.uri, document);
    }
  }

  public removeNotebookCell(cellUri: string, notebookUri: string) {
    const doc = this.getNotebook(notebookUri);

    doc.removeCell(cellUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(notebookUri);
    docSymbols.remove(cellUri);
    docErrors.delete(cellUri);
  }

  public updateNotebookCell(notebookUri: string, cell: Cell) {
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(notebookUri);

    docSymbols.remove(cell.uri);
    docErrors.delete(cell.uri);

    const parsedCell = this.parseCell(
      cell,
      doc.fileName,
      docSymbols,
      docErrors
    );
  }

  public addNotebookCell(notebookUri: string, cell: Cell) {
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(notebookUri);

    const parsedCell = this.parseCell(
      cell,
      doc.fileName,
      docSymbols,
      docErrors
    );

    doc.insertCell(parsedCell);
  }

  public unregister(uri: string) {
    const doc = this._documents.get(uri);

    if (!doc) {
      throw new Error(
        `Attempting to unregister non-existant document: ${uri}!`
      );
    }

    this._symbols.remove(doc.fileName);
    this._errors.delete(uri);
  }

  public renameFile(oldFile: FileUpdate, newFile: FileUpdate) {
    //find file
    //rename file
  }

  private parseNotebook(
    doc: Notebook,
    symbols: SymbolTable,
    errs: ErrorTable
  ): CMDLCell[] {
    let parsedCells: CMDLCell[] = [];

    for (const cell of doc.cells) {
      const parsedCell = this.parseCell(cell, doc.fileName, symbols, errs);
      parsedCells.push(parsedCell);
    }

    return parsedCells;
  }

  private parseCell(
    cell: Cell,
    fileName: string,
    symbols: SymbolTable,
    errs: ErrorTable
  ): CMDLCell {
    const results = this._compiler.parse(cell.text);
    const semanticErrors = results.recordTree.validate();

    errs.add(cell.uri, results.parserErrors);
    errs.add(cell.uri, semanticErrors);

    const builder = new SymbolTableBuilder(symbols, errs, fileName, cell.uri);

    results.recordTree.createSymbolTable(builder);

    return {
      ...cell,
      versionParsed: cell.version,
      ast: results.recordTree,
    };
  }

  private parseDocument(
    doc: Text,
    symbols: SymbolTable,
    errs: ErrorTable
  ): CmdlTree {
    const results = this._compiler.parse(doc.text);
    const semanticErrors = results.recordTree.validate();

    errs.add(doc.uri, results.parserErrors);
    errs.add(doc.uri, semanticErrors);

    const builder = new SymbolTableBuilder(
      symbols,
      errs,
      doc.fileName,
      doc.uri
    );

    results.recordTree.createSymbolTable(builder);

    return results.recordTree;
  }

  public updateDocument(doc: Text) {
    const symbolTable = this._symbols.getTable(doc.fileName);
    symbolTable.clear();

    const errTable = this._errors.get(doc.fileName);
    errTable.delete(doc.uri);

    const recordTree = this.parseDocument(doc, symbolTable, errTable);
    const document = new TextDocument(doc, doc.version, recordTree);
    this._documents.set(doc.uri, document);
  }

  public execute(docUri: string, uri?: string) {
    const document = this._documents.get(docUri);

    if (!document) {
      throw new Error(`${docUri} is not registered!`);
    }

    if (document instanceof TextDocument) {
      const visitor = this._results.createModelVisitor(docUri);
      document.ast.evaluate(visitor);
      return this._results.getOutput(docUri, docUri);
    } else {
      //get cell
      //create visitor
      //return output
    }
  }

  public transpile() {
    //converts execution results to new modality
    //caches result
    //returns transpiled result
  }

  public getErrors(uri: string, namespace: string): BaseError[] {
    const notebookErrs = this._errors.get(namespace);
    const cellErrors = notebookErrs.get(uri);
    return cellErrors;
  }
}
