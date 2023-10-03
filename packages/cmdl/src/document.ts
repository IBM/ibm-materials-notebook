import { CmdlTree } from "./cmdl-tree";

export interface Document {
  readonly uri: string;
  readonly fileName: string;
  readonly version: number;
}

export interface Notebook extends Document {
  cells: Cell[];
}

export interface Text extends Document {
  text: string;
}

export interface Cell {
  readonly uri: string;
  readonly version: number;
  text: string;
}

export interface CMDLCell extends Cell {
  ast: CmdlTree;
  versionParsed: number;
}

export class TextDocument implements Document {
  public uri: string;
  public fileName: string;
  public version: number;
  public versionParsed: number;
  public text: string;
  public ast: CmdlTree;

  constructor(doc: Text, versionParsed: number, ast: CmdlTree) {
    this.uri = doc.uri;
    this.fileName = doc.fileName;
    this.version = doc.version;
    this.versionParsed = versionParsed;
    this.text = doc.text;
    this.ast = ast;
  }
}

export class NotebookDocument implements Document {
  public uri: string;
  public fileName: string;
  public version: number;
  public cells = new Map<string, CMDLCell>();

  constructor(doc: Notebook, cells: CMDLCell[]) {
    this.uri = doc.uri;
    this.fileName = doc.fileName;
    this.version = doc.version;

    for (const cell of cells) {
      this.cells.set(cell.uri, cell);
    }
  }

  public getCell(uri: string): CMDLCell {
    const cell = this.cells.get(uri);
    if (!cell) {
      throw new Error(`Cell: ${uri} does not exist!`);
    }

    return cell;
  }

  public removeCell(uri: string): void {
    this.cells.delete(uri);
  }

  public insertCell(cell: CMDLCell) {
    this.cells.set(cell.uri, cell);
  }

  public updateCell(uri: string, cell: CMDLCell) {
    if (!this.cells.has(uri)) {
      throw new Error(`Cannot update non-existant cell: ${uri}`);
    }
    this.cells.set(uri, cell);
  }
}
