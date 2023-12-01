import * as vscode from "vscode";
import { NOTEBOOK } from "./languageProvider";
import { logger } from "../logger";
import { CmdlCompiler } from "@ibm-materials/cmdl";

/**
 * Manages all cmdl documents (.cmdnb & .cmdl) in workspace
 */
export class Repository {
  readonly compiler = new CmdlCompiler();

  private _onDidInitializeNotebook =
    new vscode.EventEmitter<vscode.NotebookDocument>();
  readonly onDidInitializeNotebook = this._onDidInitializeNotebook.event;

  private _onDidInitializeText = new vscode.EventEmitter<vscode.TextDocument>();
  readonly onDidInitializeText = this._onDidInitializeText.event;

  private readonly _disposables: vscode.Disposable[] = [];
  private readonly _documents = new Map<
    string,
    vscode.NotebookDocument | vscode.TextDocument
  >();

  constructor() {
    this._disposables.push(
      vscode.workspace.onDidChangeNotebookDocument((event) => {
        const docUri = event.notebook.uri.toString();

        if (event.contentChanges.length) {
          for (const change of event.contentChanges) {
            for (const cell of change.removedCells) {
              this.compiler.removeNotebookCell(
                cell.document.uri.toString(),
                docUri
              );
            }

            for (const cell of change.addedCells) {
              if (cell.kind === vscode.NotebookCellKind.Code) {
                const newCell = this.formatCell(cell);
                this.compiler.addNotebookCell(docUri, newCell);
              }
            }
          }
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidRenameFiles((event) => {
        for (const file of event.files) {
          logger.info(`file renamed, unregistering ${file.oldUri.toString()}`);
          this._documents.delete(file.oldUri.toString());
          this.compiler.unregister(file.oldUri.toString());
        }
      })
    );

    this._disposables.push(
      vscode.workspace.onDidDeleteFiles((event) => {
        for (const uri of event.files) {
          const fileUri = uri.toString();
          this._documents.delete(fileUri);
          this.compiler.unregister(fileUri);
        }
      })
    );
  }

  public initialize() {
    vscode.workspace
      .findFiles("**/lib/*.cmdl")
      .then(
        (files) => {
          logger.verbose(`loading cmdl documents: ${files.length}`);
          for (const uri of files) {
            logger.debug(`Opening uri ${uri.fsPath}`);
            vscode.workspace
              .openTextDocument(uri)
              .then((doc) => this.registerCMDLText(doc));
          }
        },
        () => {
          logger.info(`no cmdl files found during initialization`);
        }
      )
      .then(() => {
        vscode.workspace.findFiles("**/*.cmdnb").then((files) => {
          logger.verbose(`loading notebook documents...`);
          for (const uri of files) {
            vscode.workspace
              .openNotebookDocument(uri)
              .then((doc) => this.registerCMDLNotebook(doc));
          }
        });
      });
  }

  public getItems() {
    return this._documents.entries();
  }

  public formatNotebook(doc: vscode.NotebookDocument) {
    const fileName = this.extractFileName(doc.uri);
    const cellArr = [];

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

  public formatTextDocument(doc: vscode.TextDocument) {
    const fileName = this.extractFileName(doc.uri);
    return {
      uri: doc.uri.toString(),
      fileName: fileName,
      version: doc.version,
      text: doc.getText(),
    };
  }

  public formatCell(cell: vscode.NotebookCell) {
    return {
      uri: cell.document.uri.toString(),
      language: cell.document.languageId,
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
    const searchUri = uri.toString();

    for (const [documentUri, document] of this._documents) {
      if (documentUri === searchUri) {
        return document;
      }

      if ("notebookType" in document) {
        for (const cell of document.getCells()) {
          if (cell.document.uri.toString() === searchUri) {
            return document;
          }
        }
      }
    }
  }

  private registerCMDLText(doc: vscode.TextDocument) {
    if (doc.languageId !== "cmdl") {
      return;
    }
    const docUri = doc.uri.toString();
    if (this._documents.has(docUri)) {
      logger.info(`${docUri} is already registered`);
      return;
    }
    if (doc.uri.fragment.length) {
      return;
    }
    const textDoc = this.formatTextDocument(doc);
    this.compiler.register(textDoc);
    this._documents.set(docUri, doc);
    this._onDidInitializeText.fire(doc);
  }

  private registerCMDLNotebook(doc: vscode.NotebookDocument) {
    if (doc.notebookType !== NOTEBOOK) {
      return;
    }
    const notebookUri = doc.uri.toString();
    if (doc.uri.fragment) {
      return;
    }
    if (this._documents.has(notebookUri)) {
      logger.info(`notebook: ${notebookUri} is already registered`);
      return;
    }
    const formattedDoc = this.formatNotebook(doc);
    this.compiler.register(formattedDoc);
    this._documents.set(notebookUri, doc);
    this._onDidInitializeNotebook.fire(doc);
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
