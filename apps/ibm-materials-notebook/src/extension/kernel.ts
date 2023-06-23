import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";
import { NOTEBOOK, LANGUAGE } from "./languageProvider";

/**
 * Kernel for executiing CMDL in notebook applications
 * TODO: rename to CMDLNotebookKernel
 */
export class MaterialsKernel {
  readonly controllerId = "materials-notebook-kernel";
  readonly notebookType = NOTEBOOK;
  readonly label = "CMDL";
  readonly supportedLanguages = [LANGUAGE];
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
    _notebook: vscode.NotebookDocument,
    _controller: vscode.NotebookController
  ): void {
    logger.info("executing all cells");
    for (let cell of cells) {
      this._doExecution(cell);
    }
  }

  /**
   * Executes notebook cell
   * @param cell vscode.NotebookCell
   */
  private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
    logger.info("executing single cell");

    const doc = await vscode.workspace.openTextDocument(cell.document.uri);
    const cellUri = doc.uri.toString();
    const notebook = this.repository.find(doc.uri);

    if (!notebook || !("notebookType" in notebook)) {
      throw new Error(`unable to find notebook containing cell: ${cellUri}`);
    }

    const execution = this._controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());

    try {
      const cellOutput = this.repository._controller.execute(
        notebook.uri.toString(),
        cellUri
      );

      const fileName = this.repository.extractFileName(notebook.uri);
      const errors = this.repository._controller.getErrors(cellUri, fileName);

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
          vscode.NotebookCellOutputItem.json(cellOutput),
          vscode.NotebookCellOutputItem.json(
            fullOutput,
            "x-application/ibm-materials-notebook"
          ),
        ]),
      ]);

      logger.verbose(`...finished cell execution`);
      execution.end(true, Date.now());
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
