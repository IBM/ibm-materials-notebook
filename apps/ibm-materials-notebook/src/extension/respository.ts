import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { NOTEBOOK } from "./languageProvider";
import { logger } from "../logger";
import { CMDLController } from "cmdl";

/**
 * Manages all cmdl documents (.cmdnb & .cmdl) in workspace
 */
export class Repository {
  private readonly _controller = new CMDLController.Controller();

  private _onDidInitializeNotebook =
    new vscode.EventEmitter<vscode.NotebookDocument>();
  readonly onDidInitializeNotebook = this._onDidInitializeNotebook.event;

  private _onDidRemoveNotebook =
    new vscode.EventEmitter<vscode.NotebookDocument>();
  readonly onDidRemoveNotebook = this._onDidRemoveNotebook.event;

  private _onDidInitializeText = new vscode.EventEmitter<vscode.TextDocument>();
  readonly onDidInitializeText = this._onDidInitializeText.event;

  private _onDidRemoveText = new vscode.EventEmitter<vscode.TextDocument>();
  readonly onDidRemoveText = this._onDidRemoveText.event;

  private readonly _disposables: vscode.Disposable[] = [];
  private readonly _documents = new Map<
    string,
    vscode.NotebookDocument | vscode.TextDocument
  >();

  constructor() {
    this._disposables.push(
      vscode.workspace.onDidOpenNotebookDocument((notebookDoc) => {
        if (notebookDoc.notebookType !== NOTEBOOK) {
          return;
        }

        const notebookUri = notebookDoc.uri.toString();

        if (this._documents.has(notebookUri)) {
          throw new Error(`${notebookUri} already exists!`);
        }
        const formattedDoc = this.formatNotebook(notebookDoc);
        this._controller.register(formattedDoc);
        this._documents.set(notebookUri, notebookDoc);

        this._onDidInitializeNotebook.fire(notebookDoc);
      })
    );

    this._disposables.push(
      vscode.workspace.onDidCloseNotebookDocument((notebook) => {
        const notebookUri = notebook.uri.toString();
        if (this._documents.has(notebookUri)) {
          //? remove diagnostics
          // this._controller.unregister(notebookUri);

          this._onDidRemoveNotebook.fire(notebook);
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidChangeNotebookDocument((event) => {
        const doc = this.find(event.notebook.uri);

        if (!doc) {
          return;
        }

        const docUri = doc.uri.toString();

        if (event.contentChanges.length) {
          for (const change of event.contentChanges) {
            for (const cell of change.removedCells) {
              this._controller.removeNotebookCell(
                cell.document.uri.toString(),
                docUri
              );
            }

            for (const cell of change.addedCells) {
              if (cell.kind === vscode.NotebookCellKind.Code) {
                const newCell = this.formatCell(cell);
                this._controller.addNotebookCell(docUri, newCell);
              }
            }
          }
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId !== "cmdl") {
          return;
        }
        const docUri = doc.uri.toString();

        if (this._documents.has(docUri)) {
          throw new Error(`${docUri} already exists!`);
        }
        const textDoc = this.formatTextDocument(doc);
        this._controller.register(textDoc);
        this._documents.set(docUri, doc);
        this._onDidInitializeText.fire(doc);
      })
    );

    this._disposables.push(
      vscode.workspace.onDidCloseTextDocument((doc) => {
        if (doc.languageId !== "cmdl") {
          return;
        }

        this._onDidRemoveText.fire(doc);
      })
    );

    this._disposables.push(
      vscode.workspace.onDidRenameFiles((event) => {
        for (const file of event.files) {
          const oldFile = {
            uri: file.oldUri.toString(),
            fileName: this.extractFileName(file.oldUri),
          };
          const newFile = {
            uri: file.newUri.toString(),
            fileName: this.extractFileName(file.newUri),
          };
          this._controller.renameFile(oldFile, newFile);
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidCreateFiles((event) => {
        //register with compiler
        //create diagnostics
      })
    );

    this._disposables.push(
      vscode.workspace.onDidDeleteFiles((event) => {
        for (const uri of event.files) {
          const fileUri = uri.toString();
          this._documents.delete(fileUri);
          this._controller.unregister(fileUri);
          //remove diagnostics
        }
      })
    );
  }

  private initialize() {
    //get lib directory
    const path = "";

    fs.readdir(path, async (err, files) => {
      if (err) {
        logger.error(
          `Encountered an error during library initialization for path ${path}: ${err.message}`
        );
        vscode.window.showErrorMessage(
          `Encountered an error during library initialization for path ${path}`
        );
      } else {
        for (const file of files) {
          try {
            const readfile = await fs.promises.readFile(`${path}/${file}`, {
              encoding: "utf8",
            });
            //! register with compiler
            // const contents = JSON.parse(readfile);
            // for (const item of contents) {
            //   // storageService.setValue(item.name, item);
            // }
          } catch (error) {
            logger.warn(`Unable to initialize library contents from ${file}`);
          }
        }
      }
    });
  }

  private formatNotebook(doc: vscode.NotebookDocument) {
    const fileName = this.extractFileName(doc.uri);
    let cellArr = [];

    for (const cell of doc.getCells()) {
      if (cell.kind === vscode.NotebookCellKind.Code) {
        const cmdlCell = this.formatCell(cell);
        cellArr.push(cmdlCell);
      }
    }
    return {
      uri: doc.uri.toString(),
      fileName: fileName,
      version: doc.version,
      cells: cellArr,
    };
  }

  private formatTextDocument(doc: vscode.TextDocument) {
    const fileName = this.extractFileName(doc.uri);
    return {
      uri: doc.uri.toString(),
      fileName: fileName,
      version: doc.version,
      text: doc.getText(),
    };
  }

  private formatCell(cell: vscode.NotebookCell) {
    return {
      uri: cell.document.uri.toString(),
      text: cell.document.getText(),
      version: cell.document.version,
    };
  }

  public extractFileName(uri: vscode.Uri) {
    const fileNameArr = uri.path.split("/");
    return fileNameArr[fileNameArr.length - 1];
  }

  /**
   * Finds experiment in current repository
   * @param uri vscode.Uri
   * @returns NotebookDocument
   */
  public find(
    uri: vscode.Uri
  ): vscode.NotebookDocument | vscode.TextDocument | undefined {
    for (let [documentUri, document] of this._documents) {
      if (documentUri === uri.toString()) {
        return document;
      }

      if ("notebookType" in document) {
        for (let cells of document.getCells()) {
          if (cells.document.uri.toString() === uri.toString()) {
            return document;
          }
        }
      }
    }
  }

  /**
   * Returns all current Experiments in Repository
   * @returns IterableIterator<NotebookDocument>
   * @deprecated
   */
  public all(): IterableIterator<
    vscode.NotebookDocument | vscode.TextDocument
  > {
    return this._documents.values();
  }
}
