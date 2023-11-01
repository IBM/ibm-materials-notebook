import * as vscode from "vscode";
import {
  newCmdlNotebook,
  exportToCsv,
  parseVariableCSV,
  parseGeneratedPolymers,
  exportCurrentNotebook,
  exportCurrentWorkspace,
} from "./commands";
import { Repository } from "./respository";

//TODO: create command to automatically generate setup workspace

/**
 * Registers new commands for notebook extension
 * @param repo Repository
 * @returns vscode.Disposable
 */
export function registerCommands(repo: Repository): vscode.Disposable {
  const subscriptions: vscode.Disposable[] = [];

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.new",
      newCmdlNotebook
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
    vscode.commands.registerCommand("ibm-materials-notebook.exportRecord", () =>
      exportCurrentNotebook(repo)
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportWorkspace",
      () => exportCurrentWorkspace(repo)
    )
  );

  return vscode.Disposable.from(...subscriptions);
}
