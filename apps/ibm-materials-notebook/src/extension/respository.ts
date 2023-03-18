import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { NOTEBOOK } from "./languageProvider";
import { logger } from "../logger";
import { Experiment } from "./experiment";
import { Library } from "./library";
import { CMDLSampleResult } from "./cmdl-language/cmdl-symbols/models/sample-model";

interface CmdlEntitySource {
  title: string | undefined;
  record_id: string | null;
  notebook_id: string;
  lastUpdated: string;
}

interface CmdlEntity extends CMDLSampleResult {
  name: string;
  base_name: string;
  source: CmdlEntitySource;
}

/**
 * Manages all materials notebooks (.cmdnb) in workspace
 */
export class Repository {
  private readonly outputPath: string;
  private readonly library: Library;

  private _onDidInitialize = new vscode.EventEmitter<Experiment>();
  readonly onDidInitialize = this._onDidInitialize.event;

  private _onDidRemove = new vscode.EventEmitter<Experiment>();
  readonly onDidRemove = this._onDidRemove.event;

  private readonly _disposables: vscode.Disposable[] = [];
  private readonly _repository = new Map<vscode.NotebookDocument, Experiment>();

  /**
   * Create a new repository instance to manage materials notebooks
   * @param outputPath string Path for output folder
   * @param library string Path for library folder
   */
  constructor(outputPath: string, library: Library) {
    this.outputPath = outputPath;
    this.library = library;

    this._disposables.push(
      vscode.workspace.onDidOpenNotebookDocument(async (notebook) => {
        logger.notice(">> vscode open notebook event received");

        if (notebook.notebookType !== NOTEBOOK) {
          return;
        }

        if (this._repository.has(notebook)) {
          throw new Error(`${notebook.uri.toString()} already exists!`);
        }

        const experiment = new Experiment(
          notebook.uri,
          notebook.metadata.notebookId,
          library
        );

        await experiment.initialize(notebook);
        this._repository.set(notebook, experiment);

        logger.notice("<< firing experiment initialized event");
        this._onDidInitialize.fire(experiment);
      })
    );

    this._disposables.push(
      vscode.workspace.onDidCloseNotebookDocument((notebook) => {
        logger.notice(">> vscode close notebook event received");
        let experiment = this._repository.get(notebook);

        if (experiment) {
          this._repository.delete(notebook);

          logger.notice("<< firing repo remove event");
          this._onDidRemove.fire(experiment);
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidChangeNotebookDocument((event) => {
        logger.notice(">> vscode notebook change event received");

        let experiment = this.findExperiment(event.notebook.uri);

        if (!experiment) {
          return;
        }

        if (event.contentChanges.length) {
          for (let change of event.contentChanges) {
            for (let cell of change.removedCells) {
              experiment.delete(cell.document);
            }

            for (let cell of change.addedCells) {
              if (cell.kind === vscode.NotebookCellKind.Code) {
                experiment.insertOrUpdate(cell.document);
              }
            }
          }
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidSaveNotebookDocument((event) => {
        logger.notice(
          ">>vscode notebook saved event recieved, exporting contents to JSON lib"
        );

        let experiment = this.findExperiment(event.uri);

        if (!experiment) {
          logger.error(`Experiment: ${event.uri.toString()} not found!`);
          return;
        }

        const output = experiment.toJSON();

        if (!output) {
          logger.error(`Encountered error during extracting record output!`);
          return;
        }

        const rootUri = vscode.workspace.getWorkspaceFolder(event.uri);

        if (!rootUri) {
          logger.error(
            `No uri for current experiment at ${event.uri.toString()} found!`
          );
          return;
        }

        const filepath = event.uri.path.split("/");
        const fileName = filepath[filepath.length - 1].split(".");

        if (output?.results && output.results?.outputs) {
          let resultOutputs: CmdlEntity[] = [];
          for (const result of output.results.outputs) {
            let newResult: CmdlEntity = {
              ...result,
              name: `${result.sampleId}-${result.name}`,
              base_name: result.name,
              source: {
                title: output.title,
                record_id: output.metadata?.record_id || null,
                notebook_id: experiment.id,
                lastUpdated: new Date(Date.now()).toISOString(),
              },
            };

            this.library.addItem(newResult);
            resultOutputs.push(newResult);
          }
        }

        this.writeToOutput(output, fileName, rootUri);
      })
    );
  }

  /**
   * Writes JSON record output from experimental notebook to file
   * @param contents Contents to write to a JSON output
   * @param fileName string[] Array containing parts of a filename
   * @param rootUri vscode.WorkspaceFolder
   */
  private writeToOutput(
    contents: any,
    fileName: string[],
    rootUri: vscode.WorkspaceFolder
  ): void {
    fs.writeFile(
      path.join(
        rootUri.uri.fsPath,
        `${this.outputPath}/${fileName[0] || test}.json`
      ),
      JSON.stringify(contents, null, 2),
      (err) => {
        if (err) {
          logger.error(`Error during writing to file: ${err?.message}`);
        } else {
          vscode.window.showInformationMessage(
            `Successfully exported experiment to JSON`
          );
          logger.info(`Successfully exported experiment to JSON`);
        }
      }
    );
  }

  /**
   * Finds experiment in current repository
   * @param uri vscode.Uri
   * @returns Experiment
   */
  findExperiment(uri: vscode.Uri): Experiment | undefined {
    for (let [notebook, exp] of this._repository) {
      if (notebook.uri.toString() === uri.toString()) {
        return exp;
      }

      for (let cells of notebook.getCells()) {
        if (cells.document.uri.toString() === uri.toString()) {
          return exp;
        }
      }
    }
  }

  /**
   * Returns all current Experiments in Repository
   * @returns IterableIterator<Experiment>
   */
  all() {
    return this._repository.values();
  }
}
