import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "../respository";
import { logger } from "../../logger";

/**
 * Exports current notebook entities to a single JSON file
 */
export async function exportCurrentNotebookEntities(repo: Repository) {
  const activeNotebook = vscode.window.activeNotebookEditor;

  if (
    !activeNotebook ||
    activeNotebook.notebook.notebookType !== "ibm-materials-notebook"
  ) {
    return;
  }

  const experiment = repo.findExperiment(activeNotebook.notebook.uri);
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

  const outputPath = path.join(
    workspaceFolder.uri.fsPath,
    `/lib/${experiment.fileName}_entities.json`
  );

  const entities = experiment.exportEntities();
  const content = JSON.stringify(entities, null, 2);

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
