import * as vscode from "vscode";

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
