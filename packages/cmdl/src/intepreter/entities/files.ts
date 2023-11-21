import * as path from "path";
import { Exportable } from "./entity";

export class CharFileReader implements Exportable {
  private fileName: string;
  private filePath: string;
  private filedata?: string[][];

  constructor(filePath: string) {
    const pathObj = path.parse(filePath);
    this.filePath = filePath;
    this.fileName = pathObj.base;
  }

  get data() {
    if (!this.filedata) {
      return [];
    }
    return this.filedata;
  }

  public export() {
    return {
      fileName: this.fileName,
      filePath: this.filePath,
    };
  }
}
