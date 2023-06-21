import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";

export const LANGUAGE = "cmdl";
export const NOTEBOOK = "ibm-materials-notebook";

/**
 * Language Diagnostic for CMDL Errors
 */
class LanguageDiagnostic extends vscode.Diagnostic {
  constructor(range: vscode.Range, message: string) {
    super(range, message, 0);
  }
}

/**
 * Manages validation for CMDL language
 * TODO: add diagnostics for plain cmdl files
 */
export class Validation {
  private _disposables: vscode.Disposable[] = [];

  private readonly _collections = new Map<
    string,
    vscode.DiagnosticCollection
  >();

  /**
   * Creates a new Validation class instance
   * @param repository Repository instance of the repository for the workspace
   */
  constructor(readonly repository: Repository) {
    let handle: NodeJS.Timeout;

    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument((doc) => {
        logger.notice(">>vscode text change event received in validator");

        if (vscode.languages.match(LANGUAGE, doc.document)) {
          clearTimeout(handle);
          handle = setTimeout(
            async () => await this.validateChange(doc.document),
            500
          );
        }
      })
    );

    this._disposables.push(
      repository.onDidInitializeNotebook((exp) => {
        logger.notice(
          ">> repository initialization event received in validator"
        );
        this.validateNotebookDoc(exp);
      })
    );

    this._disposables.push(
      repository.onDidRemoveNotebook((exp) => {
        logger.notice(">> repository remove event received in validator");
        this.clearDiagnostics(exp);
      })
    );
  }

  /**
   * Validates the CMDL text for a cell after a change event has been fired
   * @param document vscode.TextDocument
   */
  async validateChange(document: vscode.TextDocument): Promise<void> {
    logger.info(`validating document:\n -> ${document.fileName}`);

    const exp = this.repository.find(document.uri);

    if (!exp) {
      throw new Error(
        `experiment: ${document.uri.toString()} not found, unable to complete validation`
      );
    }

    const expUri = exp.uri.toString();
    let collection = this._collections.get(expUri);

    if (!collection) {
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(expUri, collection);
    }

    //! deprecated change to controller update
    // await exp.insertOrUpdate(document);

    //! deprecated proxy to controller
    // exp.validateSymbols();

    if ("notebookType" in exp) {
      //! deprecated => retrieve notebook errors from compiler => add to diagnostic collection
      // for (const { doc } of exp.all()) {
      //   const diagnostics = this.createDiagnostics(exp, doc);
      //   collection.set(doc.uri, diagnostics);
      // }
    } else {
      //! retrieve text document errors => add to diagnostics collection
    }
  }

  /**
   * Disposes of vscode disposables
   */
  public dispose(): void {
    this._disposables.forEach((el) => el.dispose());
  }

  /**
   * Validates all cells in a given notebook
   * @param exp vscode.NotebookDocument
   */
  private validateNotebookDoc(exp: vscode.NotebookDocument): void {
    const expUri = exp.uri.toString();

    let collection = this._collections.get(expUri);

    if (!collection) {
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(expUri, collection);
    }

    //! proxy validation to cmdl compiler
    // exp.validateSymbols();
    //! retrived notebook errors from compiler and add to diagnostics collection
    // for (const { doc } of exp.all()) {
    //   const diagnostics = this.createDiagnostics(exp, doc);
    //   collection.set(doc.uri, diagnostics);
    // }
  }

  /**
   * Removes document diagnostics from diagnostics collection
   * @param exp vscode.NotebookDocument | vscode.TextDocument
   */
  private clearDiagnostics(
    exp: vscode.NotebookDocument | vscode.TextDocument
  ): void {
    const expUri = exp.uri.toString();
    let diagnosticCollection = this._collections.get(expUri);
    if (diagnosticCollection) {
      diagnosticCollection.dispose();
      this._collections.delete(expUri);
    }
  }

  /**
   * Creates array of VS Code diagnostics for CMDL
   * @param errors any[]
   * @param doc vscode.TextDocument vscode TextDocument to retrieve positions for diagnostics
   * @returns vscode.Diagnostic[] Array of diagnostics for a experiment
   */
  private createDiagnostics(
    errors: any[],
    doc: vscode.TextDocument
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    //! deprecated, errors will come from compiler
    // const errors = exp.getCellErrors(doc.uri.toString());
    for (const err of errors) {
      let start = doc.positionAt(err.start);
      let stop = doc.positionAt(err.stop);
      const range = new vscode.Range(start, stop);
      const codeDiagnostic = new LanguageDiagnostic(range, err.message);
      diagnostics.push(codeDiagnostic);
    }

    return diagnostics;
  }
}
