import * as vscode from "vscode";
import { logger } from "../logger";
import { Experiment } from "./experiment";
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
    Experiment,
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
            async () => await this.validateCellChange(doc.document),
            500
          );
        }
      })
    );

    this._disposables.push(
      repository.onDidInitialize((exp) => {
        logger.notice(
          ">> repository initialization event received in validator"
        );
        this.validateFullExperiment(exp);
      })
    );

    this._disposables.push(
      repository.onDidRemove((exp) => {
        logger.notice(">> repository remove event received in validator");
        this.clearExperiment(exp);
      })
    );
  }

  /**
   * Validates the CMDL text for a cell after a change event has been fired
   * @param document vscode.TextDocument
   */
  async validateCellChange(document: vscode.TextDocument): Promise<void> {
    logger.info(`validating cell:\n -> ${document.fileName}`);

    const exp = this.repository.findExperiment(document.uri);

    if (!exp) {
      throw new Error(
        `experiment: ${document.uri.toString()} not found, unable to complete validation`
      );
    }

    let collection = this._collections.get(exp);

    if (!collection) {
      logger.verbose("creating diagnostic collection for exp...");
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(exp, collection);
    }

    await exp.insertOrUpdate(document);

    exp.validateSymbols();
    for (const { doc } of exp.all()) {
      const diagnostics = this.createDiagnostics(exp, doc);
      collection.set(doc.uri, diagnostics);
    }

    logger.info(`...finished cell validation for:\n -> ${document.fileName}`);
  }

  /**
   * Disposes of vscode disposables
   */
  public dispose(): void {
    this._disposables.forEach((el) => el.dispose());
  }

  /**
   * Validates all cells in a given experiment
   * @param exp Experiment experiment document to be validated
   */
  private validateFullExperiment(exp: Experiment): void {
    logger.info(`validating experiment:\n-> ${exp.uri}`);
    let collection = this._collections.get(exp);

    if (!collection) {
      logger.verbose(`creating diagnostics collection for: \n-> ${exp.uri}`);
      collection = vscode.languages.createDiagnosticCollection();
      this._collections.set(exp, collection);
    }

    exp.validateSymbols();
    for (const { doc } of exp.all()) {
      const diagnostics = this.createDiagnostics(exp, doc);
      collection.set(doc.uri, diagnostics);
    }

    logger.info(`...validation completed for \n-> ${exp.uri}`);
  }

  /**
   * Removes experiment from diagnostics collection
   * @param exp Expriment Experiment to be removed from diagnostics collection
   */
  private clearExperiment(exp: Experiment): void {
    logger.verbose(`clearing diagnostics for: \n-> ${exp.uri}`);
    let experiment = this._collections.get(exp);
    if (experiment) {
      experiment.dispose();
      this._collections.delete(exp);
    }
  }

  /**
   * Creates array of VS Code diagnostics for CMDL
   * @param exp Experiment Experiment document to retrieve errors from
   * @param doc vscode.TextDocument vscode TextDocument to retrieve positions for diagnostics
   * @returns vscode.Diagnostic[] Array of diagnostics for a experiment
   */
  private createDiagnostics(
    exp: Experiment,
    doc: vscode.TextDocument
  ): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
    const errors = exp.getCellErrors(doc.uri.toString());
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
