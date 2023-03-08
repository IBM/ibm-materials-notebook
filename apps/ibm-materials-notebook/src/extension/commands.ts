import * as vscode from "vscode";
import { logger } from "../logger";
import { Repository } from "./respository";
import * as rl from "readline";
import * as fs from "fs";
import * as path from "path";
import { CMDLSerializer } from "./cmdl-language/cmdl-serializer";

export interface VariableDict {
  [key: string]: {
    type: "declaration" | "property";
    value: string;
    inserted: boolean;
  };
}

//TODO: create command to automatically generate setup workspace

/**
 * Sleep function to delay process
 * @param delay number ms to sleep process by
 * @returns Promise<unknown>
 */
const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * Helper function to process a record export
 * @param docUri vscode.Uri
 * @param repo Repository
 * @returns Promise<unknown>
 */
async function processRecordExport(docUri: vscode.Uri, repo: Repository) {
  const opened = await vscode.workspace.openNotebookDocument(docUri);
  await sleep(10);
  let experiment = repo.findExperiment(opened.uri);

  if (!experiment) {
    logger.warn(`unable to find experiment:\n${opened.uri.toString()}`);
    return;
  }

  return new Promise((resolve, reject) => {
    if (experiment) {
      const cellArr = opened.getCells();
      for (const cell of cellArr) {
        experiment.executeCell(cell.document.uri.toString());
      }

      let output = experiment.toJSON();

      resolve(output);
    } else {
      reject();
    }
  });
}

/**
 * Registers new commands for notebook extension
 * @param repo Repository
 * @returns vscode.Disposable
 */
export function registerCommands(repo: Repository): vscode.Disposable {
  const subscriptions: vscode.Disposable[] = [];

  /**
   * Creates a new notebook document
   */
  subscriptions.push(
    vscode.commands.registerCommand("ibm-materials-notebook.new", async () => {
      const newNotebook = await vscode.workspace.openNotebookDocument(
        "ibm-materials-notebook",
        new vscode.NotebookData([])
      );
      await vscode.commands.executeCommand(
        "vscode.openWith",
        newNotebook.uri,
        "ibm-materials-notebook"
      );
    })
  );

  /**
   * Exports all records in workspace to a JSON file
   */
  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.exportWorkspace",
      async () => {
        const documents = await vscode.workspace.findFiles("*.cmdnb");
        logger.silly(`total documents: ${documents.length}`);

        const outputArr = await Promise.all(
          documents.map(async (doc) => {
            const output = await processRecordExport(doc, repo);
            if (output) {
              return output;
            } else {
              logger.error(`Error exporting document:\n${doc.toString()}`);
              return "blah";
            }
          })
        );

        logger.silly(`json output length: ${outputArr.length}`);

        let rootUri = vscode.workspace.getWorkspaceFolder(documents[0]);

        if (!rootUri) {
          throw new Error("no workspace folder found");
        }

        fs.writeFile(
          path.join(rootUri.uri.fsPath, `exp/export.json`),
          JSON.stringify(outputArr, null, 2),
          (err) => {
            if (err) {
              logger.error(`Error during writing to file: ${err?.message}`);
            } else {
              vscode.window.showInformationMessage(
                `Successfully exported experiment to JSON`
              );
              logger.info(`Successfully exported experiment to JSON`);
            }
          }
        );
      }
    )
  );

  /**
   * Exports notebook document to CSV
   */
  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.toCSV",
      async () => {
        const activeNotebook = vscode.window.activeNotebookEditor;

        if (
          !activeNotebook ||
          activeNotebook.notebook.notebookType !== "ibm-materials-notebook"
        ) {
          return;
        }

        const experiment = repo.findExperiment(activeNotebook.notebook.uri);
        const rootUri = vscode.workspace.getWorkspaceFolder(
          activeNotebook.notebook.uri
        );

        if (!experiment || !rootUri) {
          return;
        }

        const csvString = experiment.toCSV();

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
    )
  );

  /**
   * Loads CSV containing variable values defined in a template notebook
   */
  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.loadCSV",
      async () => {
        const csvToLoad = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectMany: false,
        });

        if (!csvToLoad) {
          return;
        }

        const csvText = fs
          .readFileSync(csvToLoad[0].fsPath)
          .toString()
          .split("\r\n");
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

        const files = await vscode.workspace.findFiles(
          templateNotebookFileName
        );

        const notebook = await vscode.workspace.openNotebookDocument(files[0]);
        const rootUri = vscode.workspace.getWorkspaceFolder(files[0]);

        const experiment = repo.findExperiment(notebook.uri);

        if (!experiment || experiment.id !== templateNotebookId || !rootUri) {
          return;
        }

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
          const clonedNotebook = experiment.cloneTemplate(row);

          const content = new TextEncoder().encode(
            JSON.stringify(clonedNotebook)
          );

          const fileName = `${experiment.fileName}-clone-${count}`;

          await fs.promises.writeFile(
            `${rootUri.uri.fsPath}/${fileName}.cmdnb`,
            content
          );

          count++;
        }
      }
    )
  );

  /**
   * Parses CSV file of model output for generated polymers
   */
  subscriptions.push(
    vscode.commands.registerCommand(
      "ibm-materials-notebook.parseGeneratedPolymers",
      async () => {
        const folderURI = await vscode.window.showOpenDialog({
          canSelectFolders: true,
          canSelectFiles: false,
          canSelectMany: false,
        });

        if (!folderURI) {
          return;
        }

        const folderPath = folderURI[0].fsPath;

        const csvToLoad = await vscode.window.showOpenDialog({
          canSelectFiles: true,
          canSelectMany: false,
        });

        if (!csvToLoad) {
          return;
        }

        const stream = fs.createReadStream(csvToLoad[0].fsPath);
        const reader = rl.createInterface({ input: stream });

        let data: { structure: string; dispersity: string }[] = [];

        reader.on("line", (row) => {
          let rowData = row.split(",");
          const rowObj = { structure: rowData[0], dispersity: rowData[1] };
          data.push(rowObj);
        });

        reader.on("close", async () => {
          logger.info(
            `finished parsing generated data:\n${data
              .slice(5)
              .map(
                (el) =>
                  `structure: ${el.structure}, dispersity: ${el.dispersity}`
              )
              .join("\n-")}`
          );

          const serializer = new CMDLSerializer();

          let start = 1;
          let stop = 51;
          let testArr;
          while (start <= data.length) {
            logger.silly(`start: ${start}, stop: ${stop}`);
            if (stop > data.length) {
              testArr = data.slice(start);
            } else {
              testArr = data.slice(start, stop);
            }

            let cells: any[] = [];

            for (let i = 0; i < testArr.length; i++) {
              const item = testArr[i];
              const newCell = serializer.createGeneratedPolymerCell(item, i);
              cells.push(newCell);
            }

            const newNotebook = { metadata: {}, cells };
            const content = new TextEncoder().encode(
              JSON.stringify(newNotebook)
            );

            await fs.promises.writeFile(
              `${folderPath}/generated_output_${start}-${stop}.cmdnb`,
              content
            );
            start = stop;
            stop += 50;
          }
        });
      }
    )
  );

  return vscode.Disposable.from(...subscriptions);
}
