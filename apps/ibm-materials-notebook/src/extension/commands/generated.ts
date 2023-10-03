import * as vscode from "vscode";
import * as rl from "readline";
import * as fs from "fs";
import { CMDLSerializer } from "cmdl";
import { logger } from "../../logger";

/**
 * Parses polymer graph string representation output from RT model
 * into CMDL and writes to a new CMDL notebook with 50 example materials per notebook.
 */
export async function parseGeneratedPolymers() {
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
        .map((el) => `structure: ${el.structure}, dispersity: ${el.dispersity}`)
        .join("\n-")}`
    );

    const serializer = new CMDLSerializer();

    let start = 1;
    let stop = 51;
    let testArr;
    while (start <= data.length) {
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
      const content = new TextEncoder().encode(JSON.stringify(newNotebook));

      await fs.promises.writeFile(
        `${folderPath}/generated_output_${start}-${stop}.cmdnb`,
        content
      );
      start += 50;
      stop += 50;
    }
  });
}
