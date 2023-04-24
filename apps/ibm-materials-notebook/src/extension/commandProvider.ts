import * as vscode from "vscode";
import {
  newCmdlNotebook,
  exportCurrentWorkspce,
  exportToCsv,
  parseVariableCSV,
  parseGeneratedPolymers,
} from "./commands";
import { Repository } from "./respository";

//TODO: refactor command functions to multiple files for legibility
//TODO: add command to setup/inspect global storage
//TODO: add command to export single record
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
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportWorkspace",
      exportCurrentWorkspce
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand("ibm-materials-notebook.toCSV", exportToCsv)
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.loadCSV",
      parseVariableCSV
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.parseGeneratedPolymers",
      parseGeneratedPolymers
    )
  );

  return vscode.Disposable.from(...subscriptions);
}
