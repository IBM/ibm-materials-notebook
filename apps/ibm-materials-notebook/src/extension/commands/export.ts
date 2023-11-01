import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "../respository";
import { logger } from "../../logger";

/**
 * Exports current notebook entities to a single JSON file
 * @param repo Repository
 */
export async function exportCurrentNotebook(repo: Repository) {
  const activeNotebook = vscode.window.activeNotebookEditor;

  if (
    !activeNotebook ||
    activeNotebook.notebook.notebookType !== "ibm-materials-notebook"
  ) {
    return;
  }

  const experiment = repo.find(activeNotebook.notebook.uri);
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    activeNotebook.notebook.uri
  );

  if (!workspaceFolder) {
    logger.warn(`Unable to find valid workspace folder...`);
    return;
  }

  if (!experiment) {
    logger.error(`cannot find experiment`);
    return;
  }

  const fileName = repo.extractFileName(experiment.uri);

  const outputPath = path.join(
    workspaceFolder.uri.fsPath,
    `/lib/${fileName}_export.json`
  );

  const recordExport = repo._controller.exportFile(experiment.uri.toString());
  const content = JSON.stringify(recordExport, null, 2);

  fs.writeFile(outputPath, content, (err) => {
    if (err) {
      logger.error(`Error during writing to file: ${err?.message}`);
    } else {
      vscode.window.showInformationMessage(
        `Successfully exported experiment entities to JSON`
      );
      logger.info(`Successfully exported experiment entities to JSON`);
    }
  });
}

/**
 * Method to export repo notebooks to a JSONL file
 * @param repo Repository
 */
export async function exportCurrentWorkspace(repo: Repository) {
  const documents = await vscode.workspace.findFiles("*.cmdnb");

  if (!documents.length) {
    logger.info(`No notebook documents found in current workspace`);
    return;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(documents[0]);

  if (!workspaceFolder) {
    logger.warn(`Unable to find valid workspace folder...`);
    vscode.window.showErrorMessage(`Error finding workspace folder...`);
    return;
  }

  const outputPath = path.join(
    workspaceFolder.uri.fsPath,
    `/lib/${workspaceFolder.name}_export.jsonl`
  );

  const documentUris = documents.map((el) => el.toString());

  const repoOutput = repo._controller.exportRepository(documentUris);

  const content = repoOutput
    .map((el: unknown) => JSON.stringify(el))
    .join("\n");

  fs.writeFile(outputPath, content, (err) => {
    if (err) {
      logger.error(`Error during writing to file: ${err?.message}`);
    } else {
      logger.notice(`Success exporting ${workspaceFolder.name}`);
    }
  });

  vscode.window.showInformationMessage(
    "Completed entity export from workspace"
  );
}
