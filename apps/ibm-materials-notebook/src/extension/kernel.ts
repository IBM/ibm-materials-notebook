import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";
import { NOTEBOOK, LANGUAGE, MD_LANGUAGE } from "./languageProvider";

/**
 * Kernel for executiing CMDL in notebook applications
 * TODO: rename to CMDLNotebookKernel
 */
export class MaterialsKernel {
  readonly controllerId = "materials-notebook-kernel";
  readonly notebookType = NOTEBOOK;
  readonly label = "CMDL";
  readonly supportedLanguages = [LANGUAGE, MD_LANGUAGE];
  readonly theme = vscode.workspace
    .getConfiguration("ibm-materials-notebook")
    .get("structure-theme");

  private readonly _controller: vscode.NotebookController;
  private _executionOrder = 0;

  /**
   * Creates a new kernel instance for handling CMDL notebooks
   * @param repository Repository
   */
  constructor(readonly repository: Repository) {
    this._controller = vscode.notebooks.createNotebookController(
      this.controllerId,
      this.notebookType,
      this.label
    );

    this._controller.supportedLanguages = this.supportedLanguages;
    this._controller.supportsExecutionOrder = true;
    this._controller.executeHandler = this._execute.bind(this);
  }

  /**
   * Disposes of vscode disposables
   */
  public dispose(): void {
    this._controller.dispose();
  }

  /**
   * Executes all cells in a notebook document
   * @param cells vscode.NotebookCell[] notebook cells to be executed
   * @param _notebook vscode.NotebookDocument notebook document containing the cells
   * @param _controller vscode.NotebookController notebook controller
   */
  private _execute(
    cells: vscode.NotebookCell[],
    _notebook: vscode.NotebookDocument
    // _controller: vscode.NotebookController
  ): void {
    logger.info("executing all cells");
    for (const cell of cells) {
      this._doExecution(cell, _notebook);
    }
  }

  /**
   * Executes notebook cell
   * @param cell vscode.NotebookCell
   */
  private _doExecution(
    cell: vscode.NotebookCell,
    notebook: vscode.NotebookDocument
  ): void {
    logger.info(`executing cell: ${cell.kind}`);

    const execution = this._controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());
    const cellUri = cell.document.uri.toString();

    try {
      if (cell.document.languageId === MD_LANGUAGE) {
        const cmdpCellOutput = this.repository.compiler.execute(
          notebook.uri.toString(),
          cellUri
        );
        execution.replaceOutput(
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.text(
              cmdpCellOutput as string,
              "text/html"
            ),
          ])
        );
        execution.end(true, Date.now());
        return;
      } else {
        const cellOutput = this.repository.compiler.execute(
          notebook.uri.toString(),
          cellUri
        );

        const fileName = this.repository.extractFileName(notebook.uri);
        const errors = this.repository.compiler.getErrors(cellUri, fileName);

        if (errors.length) {
          execution.replaceOutput([
            new vscode.NotebookCellOutput([
              vscode.NotebookCellOutputItem.json(errors),
            ]),
          ]);
          logger.verbose(`...finished cell execution`);
          execution.end(false, Date.now());
        }

        const fullOutput = {
          structureTheme: this.theme,
          cellOutput,
        };

        execution.replaceOutput([
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.json(
              fullOutput,
              "x-application/ibm-materials-notebook"
            ),
            vscode.NotebookCellOutputItem.json(cellOutput),
          ]),
        ]);

        logger.verbose(`...finished cell execution`);
        execution.end(true, Date.now());
      }
    } catch (error) {
      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          vscode.NotebookCellOutputItem.json((error as Error).message),
        ]),
      ]);

      logger.verbose(`...finished cell execution`);
      execution.end(false, Date.now());
    }
  }
}
