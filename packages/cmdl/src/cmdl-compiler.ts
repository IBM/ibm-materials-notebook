import {
  ActivationRecordManager,
  CellRenderOutput,
} from "./activation-record-manager";
import { DiagnosticManager, ErrorTable } from "./error-manager";
import { SymbolTableManager } from "./symbol-manager";
import {
  Text,
  TextDocument,
  NotebookDocument,
  Notebook,
  CMDLCell,
  Cell,
  CMDPCell,
} from "./document";
import { CmdlParser } from "./cmdl-parser";
import { CmdlTree } from "./cmdl-tree";
import { BaseSymbol, SymbolTable, SymbolTableBuilder } from "./symbols";
import { logger } from "./logger";
import { BaseError } from "./errors";
import { CompiledRecord, FullRecordExport } from "./export/full-export";
import { ActivationRecordTable, Exportable } from "./intepreter";
import { TYPES } from "./cmdl-types";
import {
  CharDataEntity,
  ReactionEntity,
  ResultEntity,
} from "./intepreter/entities";
import { CMDPParser, ProtocolTableManager } from "./protocol-markdown";

interface CompletionItem {
  name: string;
  module: string;
}

/**
 * Controls CMDL functions for a given workspace
 * TODO: deprecate protocol group etc.
 * TODO: enable lookup of protocols from export method
 * TODO: handle reaction products and material records
 */
export class CmdlCompiler {
  private readonly _parser = new CmdlParser();
  private readonly _cmdpParser = new CMDPParser(this);
  private readonly _errors = new DiagnosticManager();
  private readonly _symbols = new SymbolTableManager();
  private readonly _results = new ActivationRecordManager();
  private readonly _protocols = new ProtocolTableManager();
  private readonly _documentFiles = new Map<string, string>();
  private readonly _documents = new Map<
    string,
    TextDocument | NotebookDocument
  >();

  /**
   * Method for retrieving notebook document, throws error if not found
   * @param uri uri of notebook to retrieve
   * @returns NotebookDocument
   */
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

  /**
   * Method for retrieving notebook or text document, throws error if not found
   * @param uri uri of document to retrieve
   * @returns NotebookDocument || TextDocument
   */
  public getDocument(uri: string): NotebookDocument | TextDocument {
    const document = this._documents.get(uri);

    if (!document) {
      logger.debug(`registered documents:${this.printRegistered()}`);
      throw new Error(`${uri} is not registered!`);
    }

    return document;
  }

  /**
   * Method to get uri by name of the file
   * @param fileName name of file to retrieve
   * @returns string
   */
  public getUriByFileName(fileName: string): string {
    const docUri = this._documentFiles.get(fileName);

    if (!docUri) {
      throw new Error(`${fileName} does not exist!`);
    }

    return docUri;
  }

  /**
   * Getter for SymbolTables
   * @param fileName file name to retrieve
   * @returns SymbolTable
   */
  public getSymbolTable(fileName: string): SymbolTable {
    return this._symbols.get(fileName);
  }

  /**
   * Getter for file activation records
   * @param fileName name of file to retrieve
   * @returns ActivationRecordTable
   */
  public getFileAR(fileName: string): ActivationRecordTable {
    return this._results.get(fileName);
  }

  /**
   * Method for registering a notebook or text document with the compiler.
   * Performs a parse of the document an constructs symbol and error tables
   * @param doc cmdl notebook or text file
   */
  public register(doc: Notebook | Text): void {
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
      this._protocols.create(doc.fileName);
      const parsedCells = this.parseNotebook(doc, symbolTable, errTable);
      const notebook = new NotebookDocument(doc, parsedCells);
      this._documents.set(notebook.uri, notebook);
      this._documentFiles.set(doc.fileName, notebook.uri);
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
      this._documentFiles.set(doc.fileName, doc.uri);
    }

    logger.notice(`Registration complete for ${doc.fileName}`);
  }

  /**
   * Method to delete a cell from a CMDL notebook
   * @param cellUri uri of cell to be deleted, can be either CMDL or CMDP cell
   * @param notebookUri uri of notebook containing cell
   */
  public removeNotebookCell(cellUri: string, notebookUri: string): void {
    logger.info(`removing cell:\nnotebookUri:${notebookUri}\nuri: ${cellUri}`);
    const doc = this.getNotebook(notebookUri);
    const docSymbols = this._symbols.get(doc.fileName);
    const docErrors = this._errors.get(doc.fileName);
    const docProtocols = this._protocols.get(doc.fileName);

    docSymbols.remove(cellUri);
    docErrors.delete(cellUri);
    docProtocols.delete(cellUri);
    doc.removeCell(cellUri);
    logger.info(`cell ${cellUri} has been removed`);
  }

  /**
   * Method for updating a existing cell (CMDL or CMDP) in a CMDL notebook
   * @param notebookUri uri of notebook containing cell
   * @param cell cell to be updated in notebook
   */
  public updateNotebookCell(notebookUri: string, cell: Cell): void {
    const doc = this.getNotebook(notebookUri);

    if (cell.language === "cmdl") {
      const docSymbols = this._symbols.get(doc.fileName);
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

      const parsedCell: CMDLCell = {
        ...cell,
        language: "cmdl",
        versionParsed: cell.version,
        ast: cellTree,
      };

      doc.updateCell(cell.uri, parsedCell);
    } else {
      const docProtocols = this._protocols.get(doc.fileName);
      docProtocols.delete(cell.uri);

      const cmdpCell: CMDPCell = {
        ...cell,
        language: "cmdp",
        versionParsed: cell.version,
      };
      doc.updateCell(cell.uri, cmdpCell);
    }
  }

  /**
   * Adds a cell to existing notebook document in workspace
   * @param notebookUri uri of notebook document
   * @param cell cell to be added to notebook document
   */
  public addNotebookCell(notebookUri: string, cell: Cell): void {
    const doc = this.getNotebook(notebookUri);

    if (cell.language === "cmdl") {
      const docSymbols = this._symbols.get(doc.fileName);
      const docErrors = this._errors.get(doc.fileName);

      const cellTree = this.parseCMDL({
        text: cell.text,
        uri: cell.uri,
        fileName: doc.fileName,
        symbols: docSymbols,
        errs: docErrors,
      });

      const parsedCell: CMDLCell = {
        ...cell,
        language: "cmdl",
        versionParsed: cell.version,
        ast: cellTree,
      };

      doc.insertCell(parsedCell);
    } else {
      const cmdpCell: CMDPCell = {
        ...cell,
        language: "cmdp",
        versionParsed: cell.version,
      };
      doc.insertCell(cmdpCell);
    }
  }

  /**
   * Unregisters file and removes symbols, errors, results, etc.
   * TODO: add unit tests for unregistering
   * @param uri uri of file to delete from compiler
   */
  public unregister(uri: string): void {
    const doc = this._documents.get(uri);

    if (!doc) {
      throw new Error(
        `Attempting to unregister non-existant document: ${uri}!`
      );
    }

    logger.notice(`Unregistering document: ${doc.fileName}`);
    this._symbols.remove(doc.fileName);
    this._errors.delete(doc.fileName);
    this._documentFiles.delete(doc.fileName);
    this._protocols.delete(doc.fileName);
    this._documents.delete(uri);
    logger.notice(`Unregistration complete for ${doc.fileName}`);
  }

  /**
   * Method for parsing a notebook document. Note: CMDP cells are not
   * parsed until execution of the cell as the HTML will be returned with the cell output
   * @param doc notebook to parse
   * @param symbols symbol table for document
   * @param errs error table object
   * @returns (CMDLCell | CMDPCell)[]
   */
  private parseNotebook(
    doc: Notebook,
    symbols: SymbolTable,
    errs: ErrorTable
  ): (CMDLCell | CMDPCell)[] {
    const parsedCells: (CMDLCell | CMDPCell)[] = [];

    let parsedCell: CMDLCell | CMDPCell;
    for (const cell of doc.cells) {
      if (cell.language === "cmdl") {
        const cellTree = this.parseCMDL({
          text: cell.text,
          uri: cell.uri,
          fileName: doc.fileName,
          symbols,
          errs,
        });

        parsedCell = {
          ...cell,
          language: "cmdl",
          versionParsed: cell.version,
          ast: cellTree,
        };

        parsedCells.push(parsedCell);
      } else {
        parsedCell = {
          ...cell,
          language: "cmdp",
          versionParsed: cell.version,
        };
        parsedCells.push(parsedCell);
      }
    }

    return parsedCells;
  }

  /**
   * Method for parsing CMDL and returning the AST
   * @param config contains text, uri, fileName, symbol table and error table
   * @returns CmdlTree
   */
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
    const symbolTable = this._symbols.get(doc.fileName);
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
   * the file. Throws an error if document is notebook and no cellUri is provided
   * @param docUri uri of text document or notebook
   * @param cellUri uri of cell of notebook document to be executed
   * @returns CellRenderOutput | string
   */
  public execute(docUri: string, cellUri?: string): CellRenderOutput | string {
    const document = this.getDocument(docUri);

    if (document instanceof TextDocument) {
      return this.evaluateAst(document.fileName, document, docUri);
    } else {
      if (!cellUri) {
        throw new Error(`No cell uri provided for notebook ${docUri}`);
      }
      const cell = document.getCell(cellUri);
      if (cell.language === "cmdl") {
        return this.evaluateAst(document.fileName, cell, cellUri);
      } else {
        const protocolTable = this._protocols.get(document.fileName);
        const output = this._cmdpParser.parse(cell.text, document.fileName);

        if (Object.keys(output.protocolStrings).length) {
          protocolTable.create(cell.uri, output.protocolStrings);
        }
        return output.html;
      }
    }
  }

  /**
   * Method to execute CMDL code for a notebook or text document for
   * a given file.
   * @param fileName filename to be executed
   * @param cellUri uri of cell if file is a notebook document
   * @returns unknown[]
   */
  public executeFile(fileName: string, cellUri?: string) {
    const docUri = this.getUriByFileName(fileName);
    return this.execute(docUri, cellUri);
  }

  /**
   * Method for evaluating the CMDL AST and creating output
   * @param fileName name of file containing cell or text being executed
   * @param doc CMDLCell or TextDocument being executed
   * @param uri uri string of CMDLCell or TextDocument being executed
   * @returns CellRenderOutput
   */
  private evaluateAst(
    fileName: string,
    doc: CMDLCell | TextDocument,
    uri: string
  ): CellRenderOutput {
    const visitor = this._results.createModelVisitor(fileName, this, uri);
    doc.ast.evaluate(visitor);
    return this._results.getOutput(fileName, uri);
  }

  /**
   * Method to get errors from a notebook cell or text file. Note all errors
   * for a text file are stored under a single uri in the error table.
   * @param uri uri of file or cell to retrieve errors
   * @param fileName name of file to retrieve errors
   * @returns BaseError[]
   */
  public getErrors(uri: string, fileName: string): BaseError[] {
    try {
      const notebookErrs = this._errors.get(fileName);
      const cellErrors = notebookErrs.get(uri);
      return cellErrors;
    } catch (error) {
      logger.error(
        `unable to retrieve errors for ${uri}, in file: ${fileName}:\n${error}`
      );
      return [];
    }
  }

  /**
   * Method for logging currently registered filenames
   * @returns string
   */
  private printRegistered(): string {
    const keys: string[] = [];
    for (const key of this._documents.keys()) {
      keys.push(key);
    }
    return keys.join("\n\t-");
  }

  /**
   * Provides import completions for a cmdl workspace
   * @param fileNames files to provide completions for
   * @param query user entered string query to searhc symbol tables
   * @returns
   */
  public provideImportCompletions(fileNames: string[], query: string) {
    const matchingItems: CompletionItem[] = [];
    for (const fileName of fileNames) {
      const symbolTable = this._symbols.get(fileName);
      const matchingSymbols = symbolTable.find(query);

      if (matchingSymbols.length) {
        matchingSymbols.forEach((el) => {
          const completionItem = {
            name: el,
            module: fileName,
          };
          matchingItems.push(completionItem);
        });
      }
    }

    return matchingItems;
  }

  /**
   * Method for getting entities from AR which will be exported to a record to save in
   * the database
   * @param document text or notebook document being executed
   * @param uri uri of text or notebook document being executed
   * @returns Exportable[]
   */
  private getExportables(
    document: TextDocument | NotebookDocument,
    uri: string
  ): Exportable[] {
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

  /**
   * Compiles exportable entities into records and pushes compiled record to array
   * @param fileName name of file being exported
   * @param uri uri of file being exported
   * @param entities Exportable[]
   * @returns CompiledRecord[]
   */
  private createExportRecords(
    fileName: string,
    uri: string,
    entities: Exportable[]
  ): CompiledRecord[] {
    const reactions: Record<string, FullRecordExport> = {};
    const charData: Record<string, TYPES.CharDataExport[]> = {};
    const resultData: Record<string, TYPES.ResultExport[]> = {};

    for (const entity of entities) {
      if (entity instanceof ReactionEntity) {
        const rxnRecord = new FullRecordExport(entity.export(), fileName, uri);
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

    const output: CompiledRecord[] = [];
    for (const rxnName in reactions) {
      const rxn = reactions[rxnName];
      rxn.results = rxn.results.concat(resultData[rxnName]);
      rxn.charData = rxn.charData.concat(charData[rxnName]);
      output.push(rxn.compile());
    }
    return output;
  }

  /**
   * Method to export records from a single file within a repository
   * @param uri uri of file to export
   * @returns CompiledRecord[]
   */
  public exportFile(uri: string): CompiledRecord[] {
    const document = this.getDocument(uri);
    const entities = this.getExportables(document, uri);
    const documentOutput = this.createExportRecords(
      document.fileName,
      uri,
      entities
    );
    return documentOutput;
  }

  /**
   * Export a given repository of cmdl documents
   * @param uris array of uris to be exported
   * @returns CompiledRecord[]
   */
  public exportRepository(uris: string[]): CompiledRecord[] {
    let recordExports: CompiledRecord[] = [];
    for (const documentUri of uris) {
      const document = this.getDocument(documentUri);
      const entities = this.getExportables(document, documentUri);
      const documentOutput = this.createExportRecords(
        document.fileName,
        documentUri,
        entities
      );
      recordExports = recordExports.concat(documentOutput);
    }
    return recordExports;
  }

  /**
   * Method to get members of a given CMDL symbol given a particular
   * query. Used to provide completions for dot notations (polymer structures)
   * @param fileName file to look up symbol members from
   * @param query string to match symbol members
   * @returns BaseSymbol[]
   */
  public getFileSymbolMembers(
    fileName: string,
    query: string
  ): BaseSymbol[] | undefined {
    return this._symbols.lookupMembers(fileName, query.split("."));
  }

  /**
   * Provides a list of all declared symbols in a file.
   * @param fileName name of file to lookup
   * @returns BaseSymbol[]
   */
  public getFileDeclarations(fileName: string): BaseSymbol[] {
    return this._symbols.lookupDeclarations(fileName);
  }
}
