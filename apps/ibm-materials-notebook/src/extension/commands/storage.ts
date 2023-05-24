import * as vscode from "vscode";
import { Library } from "../library";

/**
 * Initialize global extension storage for CMDL entities
 * (chemicals, polymer graphs, reactors, fragments) using cmdl-base repository
 * Expects a "./lib" subdirectory to be present
 */
export async function addToGlobalStorage(lib: Library) {
  const repoToLoad = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  });

  if (!repoToLoad) {
    return;
  }

  const libPath = `${repoToLoad[0].fsPath}/lib`;

  await lib.initializeGlobalStorage(libPath);
  vscode.window.showInformationMessage(
    `Successfully added ${repoToLoad[0].fsPath} to global storage`
  );
}

/**
 * Add repository to local workspace storage
 * @param lib Library
 */
export async function addToWorkspaceStorage(lib: Library) {
  const repoToLoad = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectMany: false,
    canSelectFolders: true,
  });

  if (!repoToLoad) {
    return;
  }

  const libPath = `${repoToLoad[0].fsPath}/lib`;
  await lib.initializeWorkspaceStorage(libPath);
  vscode.window.showInformationMessage(
    `Successfully added ${repoToLoad[0].fsPath} to global storage`
  );
}

/**
 * Command for clearing global storage for extension
 * @param lib Library
 */
export function clearGlobalStorage(lib: Library) {
  lib.clearGlobalStorage();
  vscode.window.showInformationMessage(`Cleared global extension storage`);
}

/**
 * Command for clearing workspace storage
 * @param lib Library
 */
export function clearWorkspaceStorage(lib: Library) {
  lib.clearWorkspaceStorage();
  vscode.window.showInformationMessage(`Sucessfully cleared workspace storage`);
}
