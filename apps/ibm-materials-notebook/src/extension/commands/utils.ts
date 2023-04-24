import { Uri, workspace } from "vscode";
import { logger } from "../../logger";
import { Repository } from "../respository";

export interface VariableDict {
  [key: string]: {
    type: "declaration" | "property";
    value: string;
    inserted: boolean;
  };
}

/**
 * Sleep function to delay process
 * @param delay number ms to sleep process by
 * @returns Promise<unknown>
 */
const sleep = (delay: number): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, delay));

/**
 * Helper function to process a record export
 * @param docUri vscode.Uri
 * @param repo Repository
 * @returns Promise<unknown>
 */
export async function processRecordExport(
  docUri: Uri,
  repo: Repository
): Promise<unknown> {
  const opened = await workspace.openNotebookDocument(docUri);
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
