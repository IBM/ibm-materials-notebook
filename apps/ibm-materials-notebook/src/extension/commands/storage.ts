import * as vscode from "vscode";

/**
 * Initialize global extension storage for CMDL entities
 * (chemicals, polymer graphs, reactors, fragments) using cmdl-base repository
 * Expects a "./lib" subdirectory to be present
 * @deprecated
 */
export async function addToGlobalStorage() {
  const repoToLoad = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  });

  if (!repoToLoad) {
    return;
  }

  const libPath = `${repoToLoad[0].fsPath}/lib`;

  // await lib.initializeGlobalStorage(libPath);
  vscode.window.showInformationMessage(
    `Successfully added ${repoToLoad[0].fsPath} to global storage`
  );
}

/**
 * Add repository to local workspace storage
 * @deprecated
 * @param lib Library
 */
export async function addToWorkspaceStorage() {
  const repoToLoad = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  });

  if (!repoToLoad) {
    return;
  }

  const libPath = `${repoToLoad[0].fsPath}/lib`;
  // await lib.initializeWorkspaceStorage(libPath);
  vscode.window.showInformationMessage(
    `Successfully added ${repoToLoad[0].fsPath} to global storage`
  );
}

/**
 * Command for clearing global storage for extension
 * @deprecated
 * @param lib Library
 */
export function clearGlobalStorage() {
  // lib.clearGlobalStorage();
  vscode.window.showInformationMessage(`Cleared global extension storage`);
}

/**
 * Command for clearing workspace storage
 * @deprecated
 * @param lib Library
 */
export function clearWorkspaceStorage() {
  // lib.clearWorkspaceStorage();
  vscode.window.showInformationMessage(`Sucessfully cleared workspace storage`);
}
