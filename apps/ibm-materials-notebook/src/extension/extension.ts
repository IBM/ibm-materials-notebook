// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CMDLNotebookSerializer } from "./notebookSerializer";
import { MaterialsKernel } from "./notebookExecutionKernel";
import { registerLanguageProvider } from "./languageProvider";
import { Repository } from "./respository";
import { Library } from "./library";
import { NOTEBOOK } from "./languageProvider";
import { logger } from "../logger";
import { registerCommands } from "./commandProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const wsLibPath = vscode.workspace
    .getConfiguration("ibm-materials-notebook")
    .get("library") as string;

  const library = new Library(context, wsLibPath);
  await library.initializeWorkspaceStorage();

  const repository = new Repository(wsLibPath, library);
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

  context.subscriptions.push(registerLanguageProvider(repository, library));
  //TODO: add library to register commands
  context.subscriptions.push(registerCommands(repository, library));
}

// this method is called when your extension is deactivated
export function deactivate() {}
