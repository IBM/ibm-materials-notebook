import * as vscode from "vscode";
import {
  newCmdlNotebook,
  exportCurrentWorkspce,
  exportToCsv,
  parseVariableCSV,
  parseGeneratedPolymers,
  addToGlobalStorage,
  exportCurrentNotebookEntities,
  exportCurrentWorkspaceEntities,
  clearGlobalStorage,
  clearWorkspaceStorage,
  addToWorkspaceStorage,
} from "./commands";
import { Repository } from "./respository";
import { Library } from "./library";

//TODO: create command to automatically generate setup workspace

/**
 * Registers new commands for notebook extension
 * @param repo Repository
 * @returns vscode.Disposable
 */
export function registerCommands(
  repo: Repository,
  lib: Library
): vscode.Disposable {
  const subscriptions: vscode.Disposable[] = [];

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.new",
      newCmdlNotebook
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportWorkspace",
      () => exportCurrentWorkspce(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand("ibm-materials-notebook.toCSV", () =>
      exportToCsv(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand("ibm-materials-notebook.loadCSV", () =>
      parseVariableCSV(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.parseGeneratedPolymers",
      parseGeneratedPolymers
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.addToGlobalStorage",
      () => addToGlobalStorage(lib)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.addToWorkspaceStorage",
      () => addToWorkspaceStorage(lib)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportEntities",
      () => exportCurrentNotebookEntities(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportWorkspaceEntities",
      () => exportCurrentWorkspaceEntities(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.clearGlobalStorage",
      () => clearGlobalStorage(lib)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.clearWorkspaceStorage",
      () => clearWorkspaceStorage(lib)
    )
  );

  return vscode.Disposable.from(...subscriptions);
}
