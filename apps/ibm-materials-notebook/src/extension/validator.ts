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
        if (vscode.languages.match(LANGUAGE, doc.document)) {
          clearTimeout(handle);
          handle = setTimeout(() => this.validateChange(doc.document), 500);
        }
      })
    );

    this._disposables.push(
      repository.onDidInitializeNotebook((exp) => {
        this.validateNotebookDoc(exp);
      })
    );

    this._disposables.push(
      repository.onDidRemoveNotebook((exp) => {
        this.clearDiagnostics(exp);
      })
    );
  }

  /**
   * Validates the CMDL text for a cell after a change event has been fired
   * @param document vscode.TextDocument
   */
  public validateChange(document: vscode.TextDocument): void {
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

    const doc = {
      uri: document.uri.toString(),
      fileName: this.repository.extractFileName(exp.uri),
      version: document.version,
      text: document.getText(),
    };

    if ("notebookType" in exp) {
      this.repository._controller.updateNotebookCell(expUri, doc);
    } else {
      this.repository._controller.updateDocument(doc);
    }

    const errors = this.repository._controller.getErrors(doc.uri, doc.fileName);
    const diagnostics = this.createDiagnostics(errors, document);
    collection.set(document.uri, diagnostics);
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
  private validateNotebookDoc(notebook: vscode.NotebookDocument): void {
    const notebookUri = notebook.uri.toString();

    let collection = this._collections.get(notebookUri);

    if (!collection) {
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(notebookUri, collection);
    }

    const cells = notebook.getCells();

    for (const { document } of cells) {
      const cellUri = document.uri.toString();
      const errors = this.repository._controller.getErrors(
        cellUri,
        notebookUri
      );
      const diagnostics = this.createDiagnostics(errors, document);
      collection.set(document.uri, diagnostics);
    }
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
