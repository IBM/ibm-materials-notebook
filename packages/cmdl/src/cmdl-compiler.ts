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
import { CmdlParser } from "./cmdl-parser";
import { CmdlTree } from "./cmdl-tree";
import { SymbolTable, SymbolTableBuilder } from "./symbols";
import { logger } from "./logger";
import { BaseError } from "./errors";
import { FullRecordExport } from "./export/full-export";
import { Exportable } from "./intepreter";
import { TYPES } from "@ibm-materials/cmdl-types";
import {
  CharDataEntity,
  ReactionEntity,
  ResultEntity,
} from "./intepreter/entities";

interface CompletionItem {
  name: string;
  module: string;
}

/**
 * Controls CMDL functions for a given workspace
 */
export class CmdlCompiler {
  private readonly _parser = new CmdlParser();
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

  /**
   * Method for registering a notebook or text document with the compiler.
   * Performs a parse of the document an constructs symbol and error tables
   * @param doc cmdl notebook or text file
   */
  public register(doc: Notebook | Text) {
    //check manifest if all modules have been loaded
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
      const recordTree = this.parseCMDL({
        text: doc.text,
        uri: doc.uri,
        fileName: doc.fileName,
        symbols: symbolTable,
        errs: errTable,
      });
      const document = new TextDocument(doc, doc.version, recordTree);
      this._documents.set(doc.uri, document);
      this._documentNamespaces.set(doc.fileName, doc.uri);
    }

    logger.notice(`Registration complete for ${doc.fileName}`);
  }

  /**
   * Method to delete a cell from a CMDL notebook
   * @param cellUri uri of cell to be deleted
   * @param notebookUri uri of notebook containing cell
   */
  public removeNotebookCell(cellUri: string, notebookUri: string) {
    logger.info(`removing cell:\nnotebookUri:${notebookUri}\nuri: ${cellUri}`);
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(doc.fileName);

    docSymbols.remove(cellUri);
    docErrors.delete(cellUri);
    doc.removeCell(cellUri);
    logger.info(`cell ${cellUri} has been removed`);
  }

  /**
   * Method for updating a existing cell in a CMDL notebook
   * @param notebookUri uri of notebook containing cell
   * @param cell cell to be updated in notebook
   */
  public updateNotebookCell(notebookUri: string, cell: Cell) {
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(doc.fileName);

    docSymbols.remove(cell.uri);
    docErrors.delete(cell.uri);

    const cellTree = this.parseCMDL({
      text: cell.text,
      uri: cell.uri,
      fileName: doc.fileName,
      symbols: docSymbols,
      errs: docErrors,
    });

    const parsedCell = {
      ...cell,
      versionParsed: cell.version,
      ast: cellTree,
    };

    doc.updateCell(cell.uri, parsedCell);
  }

  /**
   * Adds a cell to existing notebook document in workspace
   * @param notebookUri uri of notebook document
   * @param cell cell to be added to notebook document
   */
  public addNotebookCell(notebookUri: string, cell: Cell) {
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.getTable(doc.fileName);
    const docErrors = this._errors.get(doc.fileName);

    const cellTree = this.parseCMDL({
      text: cell.text,
      uri: cell.uri,
      fileName: doc.fileName,
      symbols: docSymbols,
      errs: docErrors,
    });

    const parsedCell = {
      ...cell,
      versionParsed: cell.version,
      ast: cellTree,
    };

    doc.insertCell(parsedCell);
  }

  /**
   * Unregisters file and removes symbols, errors, results, etc.
   * @param uri uri of file to delete from compiler
   */
  public unregister(uri: string) {
    const doc = this._documents.get(uri);

    if (!doc) {
      throw new Error(
        `Attempting to unregister non-existant document: ${uri}!`
      );
    }

    logger.notice(`Unregistering document: ${doc.fileName}`);
    this._symbols.remove(doc.fileName);
    this._errors.delete(uri);
    this._documentNamespaces.delete(doc.fileName);
    this._documents.delete(uri);
    logger.notice(`Unregistration complete for ${doc.fileName}`);
  }

  /**
   * Method for parsing a notebook document
   * @param doc notebook to parse
   * @param symbols symbol table for document
   * @param errs error table object
   * @returns CmdlCell[]
   */
  private parseNotebook(
    doc: Notebook,
    symbols: SymbolTable,
    errs: ErrorTable
  ): CMDLCell[] {
    const parsedCells: CMDLCell[] = [];

    for (const cell of doc.cells) {
      const cellTree = this.parseCMDL({
        text: cell.text,
        uri: cell.uri,
        fileName: doc.fileName,
        symbols,
        errs,
      });

      const parsedCell = {
        ...cell,
        versionParsed: cell.version,
        ast: cellTree,
      };

      parsedCells.push(parsedCell);
    }

    return parsedCells;
  }

  private parseCMDL({
    text,
    uri,
    fileName,
    symbols,
    errs,
  }: {
    text: string;
    uri: string;
    fileName: string;
    symbols: SymbolTable;
    errs: ErrorTable;
  }): CmdlTree {
    const results = this._parser.parse(text);
    const builder = new SymbolTableBuilder(symbols, errs, fileName, uri);
    results.recordTree.createSymbolTable(builder);

    const semanticErrors = results.recordTree.validate();
    symbols.validate(errs);
    errs.add(uri, results.parserErrors);
    errs.add(uri, semanticErrors);

    return results.recordTree;
  }

  /**
   * Updates text document in response to user changes
   * @param doc Text
   */
  public updateDocument(doc: Text) {
    const symbolTable = this._symbols.getTable(doc.fileName);
    symbolTable.clear();

    const errTable = this._errors.get(doc.fileName);
    errTable.delete(doc.uri);

    const recordTree = this.parseCMDL({
      text: doc.text,
      uri: doc.uri,
      fileName: doc.fileName,
      symbols: symbolTable,
      errs: errTable,
    });
    const document = new TextDocument(doc, doc.version, recordTree);
    this._documents.set(doc.uri, document);
  }

  /**
   * Method to execute a document or notebook based on uri of
   * the file.
   * @param docUri uri of text document or notebook
   * @param uri uri of cell of notebook document to be executed
   * @returns unknown[]
   */
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

  /**
   * Method to execute CMDL code for a notebook or text document for
   * a given file.
   * @param namespace filename to be executed
   * @param uri uri of cell if file is a notebook document
   * @returns unknown[]
   */
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
    return this._results.getOutput(fileName, uri);
  }

  /**
   * Method to get errors from a notebook cell or text file. Note all errors
   * for a text file are stored under a single uri in the error table.
   * @param uri uri of file or cell to retrieve errors
   * @param namespace name of file to retrieve errors
   * @returns BaseError[]
   */
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
    const keys: string[] = [];
    for (const key of this._documents.keys()) {
      keys.push(key);
    }
    return keys.join("\n\t-");
  }

  /**
   * Provides import completions for a cmdl workspace
   * @param namespaces files to provide completions for
   * @param query user entered string query to searhc symbol tables
   * @returns
   */
  public provideImportCompletions(namespaces: string[], query: string) {
    const matchingItems: CompletionItem[] = [];
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

  /**
   * @param document
   * @param uri
   * @param strategy
   * @returns
   */
  private getExportables(
    document: TextDocument | NotebookDocument,
    uri: string
  ) {
    let recordOutput: Exportable[] = [];
    if (document instanceof TextDocument) {
      recordOutput = this._results.getRecordOutput(document.fileName, uri);
    } else {
      for (const cell of document.cells.values()) {
        const cellResults = this._results.getRecordOutput(
          document.fileName,
          cell.uri
        );
        recordOutput = recordOutput.concat(cellResults);
      }
    }
    return recordOutput;
  }

  private createExportRecords(entities: Exportable[]) {
    const reactions: Record<string, FullRecordExport> = {};
    const charData: Record<string, TYPES.CharDataExport[]> = {};
    const resultData: Record<string, TYPES.ResultExport[]> = {};

    for (const entity of entities) {
      if (entity instanceof ReactionEntity) {
        const rxnRecord = new FullRecordExport(entity.export());
        reactions[entity.name] = rxnRecord;
      } else if (entity instanceof CharDataEntity) {
        const charItem = entity.export();
        if (charItem.source) {
          const charArr =
            charItem.source in charData ? charData[charItem.source] : [];
          charArr.push(charItem);
          charData[charItem.source] = charArr;
        }
      } else if (entity instanceof ResultEntity) {
        const result = entity.export();
        if (result.source) {
          const resultArr =
            result.source in resultData ? resultData[result.source] : [];
          resultArr.push(result);
          resultData[result.source] = resultArr;
        }
      } else {
        continue;
      }
    }

    const output: unknown[] = [];
    for (const rxnName in reactions) {
      const rxn = reactions[rxnName];
      rxn.results = rxn.results.concat(resultData[rxnName]);
      rxn.charData = rxn.charData.concat(charData[rxnName]);
      output.push(rxn.compile());
    }
    return output;
  }

  public exportFile(uri: string) {
    const document = this.getDocument(uri);
    const entities = this.getExportables(document, uri);
    const documentOutput = this.createExportRecords(entities);
    return documentOutput;
  }

  /**
   * Export a given repository of cmdl documents
   * @param uris
   * @returns
   */
  public exportRepository(uris: string[]) {
    let recordExports: unknown[] = [];
    for (const documentUri of uris) {
      const document = this.getDocument(documentUri);
      const entities = this.getExportables(document, documentUri);
      const documentOutput = this.createExportRecords(entities);
      recordExports = recordExports.concat(documentOutput);
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
