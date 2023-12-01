import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";
import { MD_LANGUAGE } from "./languageProvider";

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
        if (
          vscode.languages.match(LANGUAGE, doc.document) ||
          vscode.languages.match(MD_LANGUAGE, doc.document)
        ) {
          clearTimeout(handle);
          handle = setTimeout(() => this.validateChange(doc.document), 500);
        }
      })
    );

    this._disposables.push(
      repository.onDidInitializeText((doc) => {
        this.validateTextDocument(doc);
      })
    );

    this._disposables.push(
      repository.onDidInitializeNotebook((exp) => {
        this.validateNotebookDoc(exp);
      })
    );

    this._disposables.push(
      vscode.workspace.onDidRenameFiles((event) => {
        for (const file of event.files) {
          logger.info(
            `clearing diagnostics for renamed file ${file.oldUri.toString()}`
          );
          this.clearDiagnostics(file.oldUri.toString());
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidDeleteFiles((event) => {
        for (const uri of event.files) {
          logger.info(
            `clearing diagnostics for deleted file ${uri.toString()}`
          );
          this.clearDiagnostics(uri.toString());
        }
      })
    );
  }

  /**
   * Validates the CMDL text for a cell after a change event has been fired
   * @param document vscode.TextDocument
   */
  public validateChange(document: vscode.TextDocument): void {
    logger.info(`validating changed text document: ${document.uri.path}`);
    const exp = this.repository.find(document.uri);

    if (!exp) {
      throw new Error(
        `experiment: ${document.uri.toString()} not found, unable to complete validation`
      );
    }

    const expUri = exp.uri.toString();

    if (document.languageId === "cmdp") {
      logger.verbose(`updating chemical markdown cell...`);
      const doc = {
        uri: document.uri.toString(),
        language: "cmdp",
        fileName: this.repository.extractFileName(exp.uri),
        version: document.version,
        text: document.getText(),
      };
      this.repository.compiler.updateNotebookCell(expUri, doc);
    }

    let collection = this._collections.get(expUri);

    if (!collection) {
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(expUri, collection);
    }

    const doc = {
      uri: document.uri.toString(),
      language: "cmdl",
      fileName: this.repository.extractFileName(exp.uri),
      version: document.version,
      text: document.getText(),
    };

    if ("notebookType" in exp) {
      this.repository.compiler.updateNotebookCell(expUri, doc);
    } else {
      this.repository.compiler.updateDocument(doc);
    }

    const errors = this.repository.compiler.getErrors(doc.uri, doc.fileName);
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
    logger.info(`validating notebook: ${notebook.uri.path}`);
    const notebookUri = notebook.uri.toString();
    const notebookFileName = this.repository.extractFileName(notebook.uri);

    let collection = this._collections.get(notebookUri);

    if (!collection) {
      const notebookUri = notebook.uri.toString();
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(notebookUri, collection);
    }

    const cells = notebook.getCells();

    for (const { document } of cells) {
      if (document.languageId === "cmdl") {
        const cellUri = document.uri.toString();
        const errors = this.repository.compiler.getErrors(
          cellUri,
          notebookFileName
        );
        const diagnostics = this.createDiagnostics(errors, document);
        collection.set(document.uri, diagnostics);
      }
    }
  }

  private validateTextDocument(document: vscode.TextDocument): void {
    logger.info(`validating text document: ${document.uri.path}`);
    const documentUri = document.uri.toString();
    const fileName = this.repository.extractFileName(document.uri);
    let collection = this._collections.get(documentUri);

    if (!collection) {
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(documentUri, collection);
    }
    const errors = this.repository.compiler.getErrors(documentUri, fileName);
    const diagnostics = this.createDiagnostics(errors, document);
    collection.set(document.uri, diagnostics);
  }

  /**
   * Removes document diagnostics from diagnostics collection
   * @param exp string
   */
  private clearDiagnostics(uri: string): void {
    const diagnosticCollection = this._collections.get(uri);
    if (diagnosticCollection) {
      diagnosticCollection.dispose();
      this._collections.delete(uri);
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
      const start = doc.positionAt(err.start);
      const stop = doc.positionAt(err.stop);
      const range = new vscode.Range(start, stop);
      const codeDiagnostic = new LanguageDiagnostic(range, err.message);
      diagnostics.push(codeDiagnostic);
    }

    return diagnostics;
  }
}
