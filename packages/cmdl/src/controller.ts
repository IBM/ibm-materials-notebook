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
import { CMDLExporter, ProtocolProductStrategy } from "./export";
import { DefaultExport } from "./export/default-strategy";
import { Model } from "./intepreter";

type FileUpdate = {
  uri: string;
  fileName: string;
};

interface CompletionItem {
  name: string;
  module: string;
}

/**
 * Controls CMDL functions for a given workspace
 */
export class Controller {
  private readonly _compiler = new Compiler();
  private readonly _errors = new DiagnosticManager();
  private readonly _symbols = new SymbolTableManager();
  private readonly _results = new ActivationRecordManager();
  private readonly _documentNamespaces = new Map<string, string>();
  private readonly _documents = new Map<
    string,
    TextDocument | NotebookDocument
  >();

  constructor(cwd: string) {
    process.chdir(cwd);
  }

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

  public getDocument(uri: string): NotebookDocument | TextDocument {
    const document = this._documents.get(uri);

    if (!document) {
      logger.debug(`registered documents:${this.printRegistered()}`);
      throw new Error(`${uri} is not registered!`);
    }

    return document;
  }

  public getUriByNamespace(namespace: string): string {
    const docUri = this._documentNamespaces.get(namespace);

    if (!docUri) {
      throw new Error(`${namespace} does not exist!`);
    }

    return docUri;
  }

  public getSymbolTable(namespace: string) {
    return this._symbols.getTable(namespace);
  }

  public getNamespaceAR(namespace: string) {
    return this._results.get(namespace);
  }

  public register(doc: Notebook | Text) {
    if (doc.uri.split(":")[0] === "vscode-notebook-cell") {
      return;
    }

    if (this._documents.has(doc.uri)) {
      logger.verbose(`${doc.fileName} already registered with controller`);
      return;
    }

    logger.notice(`Registering ${doc.fileName}`);
    const symbolTable = this._symbols.create(doc.fileName);
    const errTable = this._errors.create(doc.fileName);
    this._results.create(doc.fileName);

    if ("cells" in doc) {
      const parsedCells = this.parseNotebook(doc, symbolTable, errTable);
      const notebook = new NotebookDocument(doc, parsedCells);
      this._documents.set(notebook.uri, notebook);
      this._documentNamespaces.set(doc.fileName, notebook.uri);
    } else {
      const recordTree = this.parseDocument(doc, symbolTable, errTable);
      const document = new TextDocument(doc, doc.version, recordTree);
      this._documents.set(doc.uri, document);
      this._documentNamespaces.set(doc.fileName, doc.uri);
    }

    logger.notice(`Registration complete for ${doc.fileName}`);
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
    const docErrors = this._errors.get(doc.fileName);

    docSymbols.remove(cell.uri);
    docErrors.delete(cell.uri);

    const parsedCell = this.parseCell(
      cell,
      doc.fileName,
      docSymbols,
      docErrors
    );
    doc.updateCell(cell.uri, parsedCell);
  }

  public addNotebookCell(notebookUri: string, cell: Cell) {
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(doc.fileName);

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
    this._documentNamespaces.delete(doc.fileName);
    this._documents.delete(uri);
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
    const builder = new SymbolTableBuilder(symbols, errs, fileName, cell.uri);
    results.recordTree.createSymbolTable(builder);
    // logger.verbose(`current symbolTable:\n${symbols.print()}`);

    symbols.validate(errs);
    errs.add(cell.uri, results.parserErrors);
    errs.add(cell.uri, semanticErrors);

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
    const builder = new SymbolTableBuilder(
      symbols,
      errs,
      doc.fileName,
      doc.uri
    );

    results.recordTree.createSymbolTable(builder);

    symbols.validate(errs);
    errs.add(doc.uri, results.parserErrors);
    errs.add(doc.uri, semanticErrors);

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
    const document = this.getDocument(docUri);

    if (document instanceof TextDocument) {
      return this.evaluateAst(document.fileName, document, docUri);
    } else {
      if (!uri) {
        logger.warn(`no cell uri provided...executing entire notebook...`);
        let notebookResults: unknown[] = [];
        for (const cell of document.cells.values()) {
          const cellResults = this.evaluateAst(
            document.fileName,
            cell,
            cell.uri
          );
          notebookResults = notebookResults.concat(cellResults);
        }
        return notebookResults;
      }
      const cell = document.getCell(uri);
      return this.evaluateAst(document.fileName, cell, uri);
    }
  }

  public executeNamespace(namespace: string, uri?: string) {
    const docUri = this.getUriByNamespace(namespace);
    return this.execute(docUri, uri);
  }

  private evaluateAst(
    fileName: string,
    doc: CMDLCell | TextDocument,
    uri: string
  ) {
    const visitor = this._results.createModelVisitor(fileName, this, uri);
    doc.ast.evaluate(visitor);
    const results = this._results
      .getOutput(fileName, uri)
      .map((el) => el.export());
    return results;
  }

  public getErrors(uri: string, namespace: string): BaseError[] {
    try {
      const notebookErrs = this._errors.get(namespace);
      const cellErrors = notebookErrs.get(uri);
      return cellErrors;
    } catch (error) {
      logger.error(
        `unable to retrieve errors for ${uri}, in namespace: ${namespace}:\n${error}`
      );
      return [];
    }
  }

  private printRegistered() {
    let keys: string[] = [];
    for (const key of this._documents.keys()) {
      keys.push(key);
    }
    return keys.join("\n\t-");
  }

  public provideImportCompletions(namespaces: string[], query: string) {
    let matchingItems: CompletionItem[] = [];
    for (const namespace of namespaces) {
      const symbolTable = this._symbols.getTable(namespace);
      const matchingSymbols = symbolTable.find(query);

      if (matchingSymbols.length) {
        matchingSymbols.forEach((el) => {
          const completionItem = {
            name: el,
            module: namespace,
          };
          matchingItems.push(completionItem);
        });
      }
    }

    return matchingItems;
  }

  private createExport(
    document: TextDocument | NotebookDocument,
    uri: string,
    strategy: "default" | "protocol" = "default"
  ) {
    if (document instanceof TextDocument) {
      const recordOutput = this._results.getOutput(document.fileName, uri);
      const exporter = new CMDLExporter(
        strategy === "default"
          ? new DefaultExport()
          : new ProtocolProductStrategy()
      );
      const record = exporter.exportRecord(recordOutput as Model<unknown>[]);
      return record;
    } else {
      let notebookResults: unknown[] = [];
      for (const cell of document.cells.values()) {
        const cellResults = this._results.getOutput(
          document.fileName,
          cell.uri
        );
        notebookResults = notebookResults.concat(cellResults);
      }
      const exporter = new CMDLExporter(
        strategy === "default"
          ? new DefaultExport()
          : new ProtocolProductStrategy()
      );
      const record = exporter.exportRecord(notebookResults as Model<unknown>[]);
      return record;
    }
  }

  public exportProtocolProd(uri: string) {
    const document = this.getDocument(uri);
    return this.createExport(document, uri, "protocol");
  }

  public exportRecord(uri: string) {
    const document = this.getDocument(uri);
    return this.createExport(document, uri);
  }

  public exportRepository(uris: string[]) {
    const recordExports: any[] = [];
    for (const documentUri of uris) {
      const record = this.exportRecord(documentUri);
      recordExports.push(record);
    }
    return recordExports;
  }

  public getNamespaceSymbolMembers(namespace: string, query: string) {
    return this._symbols.lookupMembers(namespace, query.split("."));
  }

  public getNamespaceDeclarations(namespace: string) {
    return this._symbols.lookupDeclarations(namespace);
  }
}
