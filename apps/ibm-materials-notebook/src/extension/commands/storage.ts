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
