import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { logger } from "../../logger";
import { Repository } from "../respository";
import { VariableDict } from "./utils";

//TODO: refactor template import/export

/**
 * Exports active notebook document to CSV file with columns for each declared variable
 * TODO: pull variables from controller
 * @param repo Repository
 */
export async function exportToCsv(repo: Repository) {
  const activeNotebook = vscode.window.activeNotebookEditor;

  if (
    !activeNotebook ||
    activeNotebook.notebook.notebookType !== "ibm-materials-notebook"
  ) {
    return;
  }

  const experiment = repo.find(activeNotebook.notebook.uri);
  const rootUri = vscode.workspace.getWorkspaceFolder(
    activeNotebook.notebook.uri
  );

  if (!experiment || !rootUri) {
    return;
  }

  const csvString = "experiment.toCSV()";

  fs.writeFile(
    path.join(rootUri.uri.fsPath, `exp/var_test.csv`),
    csvString,
    (err) => {
      if (err) {
        logger.error(`Error during writing to file: ${err?.message}`);
      } else {
        vscode.window.showInformationMessage(
          `Successfully exported experiment to CSV`
        );
        logger.info(`Successfully exported experiment to CSV`);
      }
    }
  );
}

/**
 * Creates Cmdl notebooks based on template from CSV file
 */
export async function parseVariableCSV(repo: Repository) {
  const csvToLoad = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectMany: false,
  });

  if (!csvToLoad) {
    return;
  }

  const csvText = fs.readFileSync(csvToLoad[0].fsPath).toString().split("\r\n");
  const headers = csvText[0].split(",");
  const columns: {
    var_name: string;
    var_type: "declaration" | "property";
  }[] = csvText[1].split(",").map((item) => {
    if (item.indexOf("$") === -1) {
      return {
        var_name: item,
        var_type: "declaration",
      };
    } else {
      return {
        var_name: item,
        var_type: "property",
      };
    }
  });

  const templateNotebookId = headers[1];
  const templateNotebookFileName = headers[3];

  const files = await vscode.workspace.findFiles(templateNotebookFileName);

  const notebook = await vscode.workspace.openNotebookDocument(files[0]);
  const rootUri = vscode.workspace.getWorkspaceFolder(files[0]);

  const experiment = repo.find(notebook.uri);

  if (!experiment || !rootUri) {
    return;
  }

  const fileName = repo.extractFileName(notebook.uri);

  const rows = csvText.slice(2);
  const formattedRows = [];

  for (const row of rows) {
    const rowItems = row.split(",");
    const rowVar: VariableDict = {};

    for (let i = 0; i < columns.length; i++) {
      const columnName = columns[i];
      const columnValue = rowItems[i];
      rowVar[columnName.var_name] = {
        type: columnName.var_type,
        inserted: false,
        value: columnValue,
      };
    }
    formattedRows.push(rowVar);
  }

  let count = 1;
  for (const row of formattedRows) {
    // const clonedNotebook = experiment.cloneTemplate(row);

    const content = new TextEncoder().encode(JSON.stringify("clonedNotebook"));

    const outputFileName = `${fileName}-clone-${count}`;

    await fs.promises.writeFile(
      `${rootUri.uri.fsPath}/${outputFileName}.cmdnb`,
      content
    );

    count++;
  }
}
