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

  public initialize() {
    //register & execute lib documents into symbol table
  }

  public register(doc: Notebook | Text) {
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
    //find notebook document
    //delete cell
    //reparse document and dependencies
    //update diagnostics
  }

  public addNotebookCell(notebookUri: string, cell: Cell) {
    //find notebook document
    //delete cell
    //reparse document and dependencies
    //update diagnostics
  }

  public unregister(uri: string) {
    //remove document
    //delete symbols
    //re-parse dependencies
    //notify successful removal
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
      const results = this._compiler.parse(cell.text);
      const semanticErrors = results.recordTree.validate();

      errs.add(cell.uri, results.parserErrors);
      errs.add(cell.uri, semanticErrors);

      const builder = new SymbolTableBuilder(
        symbols,
        errs,
        doc.fileName,
        cell.uri
      );

      results.recordTree.createSymbolTable(builder);

      const parsedCell: CMDLCell = {
        ...cell,
        versionParsed: cell.version,
        ast: results.recordTree,
      };
      parsedCells.push(parsedCell);
    }

    return parsedCells;
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

  public update(uri: string) {
    //find document => check versions
    //parse new text => update document
    //update symbol table and error table
    //
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

  public getNamespaceErrors(namespace: string): ErrorTable {
    const errTable = this._errors.get(namespace);
    return errTable;
  }
}
