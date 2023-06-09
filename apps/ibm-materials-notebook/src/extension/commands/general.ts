import * as vscode from "vscode";
import * as fs from "fs";
import { logger } from "../../logger";
import { processRecordExport } from "./utils";
import { Repository } from "../respository";

/**
 * Creates a new blank CMDL notebook
 */
export async function newCmdlNotebook() {
  const newNotebook = await vscode.workspace.openNotebookDocument(
    "ibm-materials-notebook",
    new vscode.NotebookData([])
  );
  await vscode.commands.executeCommand(
    "vscode.openWith",
    newNotebook.uri,
    "ibm-materials-notebook"
  );
}

/**
 * Exports current CMDL workspace to single JSON file and saves to user selected destination.
 */
export async function exportCurrentWorkspce(repo: Repository) {
  const documents = await vscode.workspace.findFiles("*.cmdnb");
  logger.silly(`total documents: ${documents.length}`);

  const exportFolder = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  });

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(documents[0]);

  if (!exportFolder || !workspaceFolder) {
    return;
  }

  const outputArr = await Promise.all(
    documents.map(async (doc) => {
      const output = await processRecordExport(doc, repo);
      if (output) {
        return output;
      } else {
        logger.error(`Error exporting document:\n${doc.toString()}`);
        return "blah";
      }
    })
  );

  logger.silly(`json output length: ${outputArr.length}`);

  let rootUri = vscode.workspace.getWorkspaceFolder(documents[0]);

  if (!rootUri) {
    throw new Error("no workspace folder found");
  }

  fs.writeFile(
    `${exportFolder[0].fsPath}/${workspaceFolder.name}_export.json`,
    JSON.stringify(outputArr, null, 2),
    (err) => {
      if (err) {
        logger.error(`Error during writing to file: ${err?.message}`);
      } else {
        vscode.window.showInformationMessage(
          `Successfully exported workspace ${workspaceFolder.name} to JSON`
        );
        logger.info(
          `Successfully exported workspace  ${workspaceFolder.name} to JSON`
        );
      }
    }
  );
}
