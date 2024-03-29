import * as vscode from "vscode";
import { TextDecoder, TextEncoder } from "util";
import { randomUUID } from "crypto";

interface RawNotebookData {
  metadata: Record<string, string>;
  cells: RawNotebookCell[];
}

interface RawNotebookCell {
  language: string;
  value: string;
  kind: vscode.NotebookCellKind;
  outputs: RawCellOutput[];
}

interface RawCellOutput {
  mime: string;
  value: any;
}

/**
 * Serializes CMDL notebooks
 */
export class CMDLNotebookSerializer implements vscode.NotebookSerializer {
  /**
   * Encodes raw notebookcell data into VS Code NotebookCellOutputItem
   * @param raw RawNotebookCell
   * @returns vscode.NotebookCellOutputItem[]
   */
  private convertRawToBytes(raw: RawNotebookCell): vscode.NotebookCellOutput[] {
    const results: vscode.NotebookCellOutputItem[] = [];

    for (const output of raw.outputs) {
      let data;
      if (raw.language == "cmdp") {
        data = new TextEncoder().encode(`${output.value}`);
      } else {
        data = new TextEncoder().encode(JSON.stringify(output.value, null, 2));
      }

      results.push(new vscode.NotebookCellOutputItem(data, output.mime));
    }

    return [new vscode.NotebookCellOutput(results)];
  }

  /**
   * Converts encoded NoteBookCellData into raw CMDL cell
   * @param cell vscode.NotebookCellData vscode.NotebookCellData to be converted into raw CMDL cell
   * @returns RawCellOutput[]
   */
  private convertToRawOutput(cell: vscode.NotebookCellData): RawCellOutput[] {
    if (!cell.outputs) {
      return [];
    }

    const results: RawCellOutput[] = [];

    if (cell.languageId === "cmdl") {
      for (const output of cell.outputs) {
        for (const item of output.items) {
          const outputContents = new TextDecoder().decode(item.data);
          const outputData = JSON.parse(outputContents);
          results.push({ mime: item.mime, value: outputData });
        }
      }
    } else {
      for (const output of cell.outputs) {
        for (const item of output.items) {
          const outputContents = new TextDecoder().decode(item.data);
          const outputData = outputContents.slice(0, outputContents.length - 1);
          results.push({ mime: item.mime, value: outputData });
        }
      }
    }

    return results;
  }

  /**
   * Deserializes CMDL notebook
   * @param content Uint8Array Encodede notebook data
   * @param _token vscode.CancellationToken
   * @returns Promise<vscode.NotebookData>
   */
  async deserializeNotebook(
    content: Uint8Array
    // _token: vscode.CancellationToken
  ): Promise<vscode.NotebookData> {
    const stringContent = new TextDecoder().decode(content);

    let raw: RawNotebookData;
    try {
      raw = <RawNotebookData>JSON.parse(stringContent);
    } catch {
      raw = { metadata: {}, cells: [] };
    }

    const cells = raw.cells.map((item) => {
      const newCell = new vscode.NotebookCellData(
        item.kind,
        item.value,
        item.language
      );
      if (item.outputs) {
        newCell.outputs = this.convertRawToBytes(item);
      }
      return newCell;
    });

    const notebook = new vscode.NotebookData(cells);
    notebook.metadata = { ...raw.metadata };

    if (!raw.metadata?.notebookId) {
      notebook.metadata.notebookId = randomUUID();
    }

    return notebook;
  }

  /**
   * Serializes notebook data
   * @param data vscode.NotebookData Data to serialize
   * @param _token vscode.CancellationToken
   * @returns Promise<Uint8Array>
   */
  async serializeNotebook(
    data: vscode.NotebookData
    // _token: vscode.CancellationToken
  ): Promise<Uint8Array> {
    const cellContents: RawNotebookCell[] = [];

    for (const cell of data.cells) {
      let outputs: vscode.NotebookCellOutput[] = [];
      if (cell.outputs) {
        outputs = outputs.concat(cell.outputs);
      }

      cellContents.push({
        kind: cell.kind,
        language: cell.languageId,
        value: cell.value,
        outputs: this.convertToRawOutput(cell),
      });
    }

    const content = {
      metadata: data.metadata,
      cells: cellContents,
    };

    return new TextEncoder().encode(JSON.stringify(content));
  }
}
