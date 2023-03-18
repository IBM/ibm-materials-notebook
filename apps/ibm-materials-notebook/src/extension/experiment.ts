import * as vscode from "vscode";
import { CmdlTree } from "./cmdl-language/cmdl-tree";
import { CmdlCompiler, ModelARManager, ModelVisitor } from "./cmdl-language";
import { SymbolTable } from "./cmdl-language";
import { logger } from "../logger";
import { ErrorTable } from "./errors";
import {
  PropertySymbol,
  SymbolTableBuilder,
  SymbolType,
} from "./cmdl-language/cmdl-symbols/symbols";
import { RecordDirector } from "./exports/record-director";
import { VariableDict } from "./commands";
import { Library } from "./library";
import { CmdlCompletions } from "./cmdl-language/cmdl-completions";
import {
  CMDLMetaData,
  CMDLRecordTypes,
} from "./cmdl-language/cmdl-symbols/symbol-types";
import { BaseError } from "./cmdl-language/errors";
import { BaseSymbol } from "./cmdl-language/cmdl-symbols/symbols/cmdl-symbol-base";
import { ExpRecord } from "./exports/exp-builder";
import { FlowRecord } from "./exports/flow-exp-builder";

interface CmdlCell {
  versionParsed: number;
  doc: vscode.TextDocument;
  recordTree: CmdlTree;
}

/**
 * Manages values for individual notebook in workspace
 */
export class Experiment {
  readonly id: string;
  readonly uri: string;
  readonly fileName: string;
  private readonly library: Library;
  private readonly _cells = new Map<string, CmdlCell>();
  private readonly _errorTable = new ErrorTable();
  private readonly _compiler = new CmdlCompiler();
  private readonly _symbolTable = new SymbolTable("GLOBAL");
  private readonly _globalAR: ModelARManager;

  /**
   * Creates a new Experiment instance
   * @param uri vscode.Uri
   * @param id string
   * @param library Library
   */
  constructor(uri: vscode.Uri, id: string, library: Library) {
    this.id = id;
    this.uri = uri.toString();
    const filepath = uri.path.split("/");
    this.fileName = filepath[filepath.length - 1];
    this._globalAR = new ModelARManager(this.uri);
    this.library = library;
  }

  /**
   * Initializes Experiment, inserts cells
   * @param notebook vscode.NotebookDocument
   */
  async initialize(notebook: vscode.NotebookDocument) {
    try {
      for (const cell of notebook.getCells()) {
        if (cell.kind === vscode.NotebookCellKind.Code) {
          await this.insertOrUpdate(cell.document);
        }
      }
    } catch (error) {
      logger.error(`Unable to load cells for ${notebook.uri.toString()}`);
      logger.error(error);
    }
  }

  /**
   * Parses cell text contents and generates errors and symbols
   * @param doc vscode text document for cell
   */
  async insertOrUpdate(doc: vscode.TextDocument) {
    const uri = doc.uri.toString();
    const cellValue = this._cells.get(uri);

    if (!cellValue || cellValue.versionParsed !== doc.version) {
      logger.verbose(`inserting cell: \n${uri}`);

      this._symbolTable.remove(uri);
      this._errorTable.delete(uri);

      const { recordTree, parserErrors } = this._compiler.parse(doc.getText());
      const semanticErrors = await recordTree.validate(this.library);

      this._errorTable.add(uri, parserErrors);
      this._errorTable.add(uri, semanticErrors);

      const builder = new SymbolTableBuilder(
        this._symbolTable,
        this._errorTable,
        uri
      );
      recordTree.createSymbolTable(builder);

      const compiledValues = {
        versionParsed: doc.version,
        recordTree,
        doc,
      };

      this._cells.set(uri, compiledValues);
    }
  }

  /**
   * Validates symbol table and pushes errors to error table
   */
  public validateSymbols(): void {
    this._symbolTable.validate(this._errorTable);
  }

  /**
   * Method to check whether experiment has cell document
   * @param doc vscode text document for cell
   * @returns boolean
   */
  public hasCell(doc: vscode.TextDocument): boolean {
    return this._cells.has(doc.uri.toString());
  }

  /**
   * Method to remove cell from experiment notebook
   * clears all outputs symbols and errors from tables
   * @todo clear entities from workspace storage?
   * @param doc vscode text document
   */
  public delete(doc: vscode.TextDocument): void {
    const uri = doc.uri.toString();
    this._symbolTable.remove(uri);
    this._cells.delete(uri);
    this._globalAR.deleteRecord(uri);
    this._errorTable.delete(uri);
  }

  /**
   * Method to retrieve cell output from output table
   * @param uri uri string from vscode text document
   * @returns unknown[]
   */
  public getCellOutput(uri: string): unknown[] {
    const outputRecord = this._globalAR.getRecord(uri);
    return [...outputRecord.values()];
  }

  /**
   * Method to retrieve errors for a given cell from the cell table
   * @param uri uri string from vscode text document
   * @returns BaseError[]
   */
  public getCellErrors(uri: string): BaseError[] {
    return this._errorTable.get(uri);
  }

  /**
   * Retrieves all cell recordTrees
   * @returns IterableIterator
   */
  public all(): IterableIterator<CmdlCell> {
    return this._cells.values();
  }

  /**
   * Creates model visitor and traverses cell record tree to evaluate defined models.
   * Saves model output to global AR.
   * @TODO Optimize to avoid unecessary recomputation if nothing has changed
   * @param uri uri for cell being executed
   */
  public async executeCell(uri: string): Promise<void> {
    const cell = this._cells.get(uri);

    if (!cell) {
      throw new Error(`cell: ${uri} does not exist`);
    }

    const globalAR = this._globalAR.createGlobalAR(uri);
    const modelVisitor = new ModelVisitor(globalAR, uri);

    cell.recordTree.evaluate(modelVisitor);
  }

  /**
   * Method to retrieve matching symbols for completion provider
   * @param query text string from completion provider
   * @returns string[]
   */
  public getSymbols(): BaseSymbol[] {
    return this._symbolTable.getBaseSymbols();
  }

  public getSymbolMembers(word: string): BaseSymbol[] | undefined {
    const path = word.split(".");
    return this._symbolTable.getSymbolMembers(path);
  }

  /**
   * Method to extract template variables from experiment and format for writing to CSV file
   */
  public toCSV(): string {
    const templateVariableSymbols = this._symbolTable.exportVariables();
    const templateVariables = templateVariableSymbols
      .map((el) => {
        if (el.type === SymbolType.VARIABLE_DEC) {
          return el.name;
        } else {
          return (el as PropertySymbol<string>).value;
        }
      })
      .join(",");
    const csv = `id,${this.id},filename,${this.fileName}\r\n${templateVariables}`;
    return csv;
  }

  /**
   * Method to parse read variable definitions into each cells record tree.
   */
  public cloneTemplate(templateVar: VariableDict) {
    logger.debug(`template variables`, { meta: templateVar });
    const newCells = [];

    for (const cell of this._cells.values()) {
      let cellText = cell.doc.getText();
      for (const [variable, metadata] of Object.entries(templateVar)) {
        if (metadata.type === "declaration") {
          const decRegex = new RegExp(`\\$${variable}`);
          const refRegex = new RegExp(`@${variable}`);

          if (!metadata.inserted && decRegex.test(cellText)) {
            cellText = cellText.replace(decRegex, metadata.value);
            logger.silly(`cell text:\n${cellText}`);
            metadata.inserted = true;
          }

          if (refRegex.test(cellText)) {
            cellText = cellText.replace(refRegex, `@${metadata.value}`);
          }
        } else {
          if (metadata.inserted) {
            continue;
          }

          const propRegex = new RegExp(`\\${variable}`);

          if (propRegex.test(cellText)) {
            const propSym = this._symbolTable.findVarSymbol(variable);

            if (!propSym) {
              throw new Error(`variable property: ${variable} is not defined`);
            }
            const isStringProperty = CmdlCompletions.isStringProperty(
              propSym.name
            );

            if (isStringProperty) {
              cellText = cellText.replace(propRegex, `"${metadata.value}"`);
            } else {
              cellText = cellText.replace(propRegex, metadata.value);
            }

            metadata.inserted = true;
          }
        }
      }
      const newCell = { kind: 2, language: "cmdl", value: cellText };
      newCells.push(newCell);
    }
    return { metadata: {}, cells: newCells };
  }

  /**
   * Serializes notebook to an object for writing to file
   * @TODO improve output types
   * @TODO ensure new entities are saved to workspace storage
   * @returns FlowExp | ExpRecord | undefined
   */
  public toJSON(): FlowRecord | ExpRecord | undefined {
    const hasVariables = this._symbolTable.hasVariables();

    if (hasVariables) {
      vscode.window.showWarningMessage(
        "Cannot export to JSON as when variables are present!"
      );
      return;
    }

    const errors = this._errorTable.all();

    if (errors.length) {
      vscode.window.showWarningMessage(
        "Error during saving: cannot export to JSON as errors are present!"
      );
      logger.warn(`cannot export ${this.uri} to JSON as errors are present!`);
      return;
    }

    const metadata = this._globalAR.getOptionalValue<CMDLMetaData>("metadata");

    if (!metadata) {
      vscode.window.showWarningMessage(
        `Metadata is not defined, cannot export to JSON`
      );
      logger.warn(`Metadata is not defined, cannot export to JSON`);
      return;
    }

    //TODO: force notebookId to be readonly after merge with metadata
    metadata.notebookId = this.id;
    const recordManager = new RecordDirector();
    const values = this._globalAR.all<CMDLRecordTypes>();

    const record = recordManager.build(metadata, values);
    return record;
  }
}
