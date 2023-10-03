// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CMDLNotebookSerializer } from "./serializer";
import { MaterialsKernel } from "./kernel";
import { registerLanguageProvider } from "./languageProvider";
import { Repository } from "./respository";
import { NOTEBOOK } from "./languageProvider";
import { logger } from "../logger";
import { registerCommands } from "./commandProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  logger.info(
    `workspace path: ${
      vscode.workspace.workspaceFolders
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : ""
    }`
  );
  const repository = new Repository();
  repository.initialize();
  logger.info("IBM Materials notebook extension is activated");

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  context.subscriptions.push(
    new MaterialsKernel(repository),
    vscode.workspace.registerNotebookSerializer(
      NOTEBOOK,
      new CMDLNotebookSerializer()
    )
  );

  context.subscriptions.push(registerLanguageProvider(repository));
  context.subscriptions.push(registerCommands(repository));
}

// this method is called when your extension is deactivated
export function deactivate() {}
