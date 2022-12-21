import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";
import { NOTEBOOK, LANGUAGE } from "./languageProvider";

/**
 * Kernel for executiing CMDL in notebook applications
 */
export class MaterialsKernel {
  readonly controllerId = "materials-notebook-kernel";
  readonly notebookType = NOTEBOOK;
  readonly label = "My Notebook";
  readonly supportedLanguages = [LANGUAGE];

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
  dispose(): void {
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
    logger.verbose(`executing cell ${cell.document.fileName}...`);

    const doc = await vscode.workspace.openTextDocument(cell.document.uri);
    const experiment = this.repository.findExperiment(doc.uri);
    const cellUri = doc.uri.toString();
    const execution = this._controller.createNotebookCellExecution(cell);
    execution.executionOrder = ++this._executionOrder;
    execution.start(Date.now());

    try {
      if (!experiment) {
        throw new Error(`unable to find experiment via ${doc.uri.toString()}`);
      }

      //parse executed cell
      await experiment.insertOrUpdate(doc);

      const errors = experiment.getCellErrors(cellUri);

      //if parse errors display
      if (errors.length) {
        execution.replaceOutput([
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.json(errors),
          ]),
        ]);
        logger.verbose(`...finished cell execution`);
        execution.end(false, Date.now());
      }

      experiment.executeCell(cellUri);

      //TODO: update notebook metadata?

      const output = experiment.getCellOutput(cellUri);

      execution.replaceOutput([
        new vscode.NotebookCellOutput([
          vscode.NotebookCellOutputItem.json(output),
          vscode.NotebookCellOutputItem.json(
            output,
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
