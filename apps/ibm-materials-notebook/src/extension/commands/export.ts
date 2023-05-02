import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Repository } from "../respository";
import { sleep } from "./utils";
import { logger } from "../../logger";

//TODO: create command to export entities from entire repository to separate JSON files

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

export async function exportCurrentWorkspaceEntities(repo: Repository) {
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

  logger.info(`Exporting entities from ${documents.length} files`);
  for (const docUri of documents) {
    const openedDoc = await vscode.workspace.openNotebookDocument(docUri);
    const exp = repo.findExperiment(openedDoc.uri);

    if (!exp) {
      vscode.window.showErrorMessage(
        `Errors during exporting ${openedDoc.uri.fsPath}...`
      );
      continue;
    }

    const outputPath = path.join(
      workspaceFolder.uri.fsPath,
      `/lib/${exp.fileName}_entities.json`
    );

    await exp.executeAll();
    const entities = exp.exportEntities();
    const content = JSON.stringify(entities, null, 2);

    fs.writeFile(outputPath, content, (err) => {
      if (err) {
        logger.error(`Error during writing to file: ${err?.message}`);
      } else {
        logger.notice(`Success exporting ${exp.fileName}`);
      }
    });
  }

  vscode.window.showInformationMessage("Completed entity from workspace");
}