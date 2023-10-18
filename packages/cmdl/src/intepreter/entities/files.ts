import * as fs from "fs";
import * as path from "path";
import { Exportable } from "./entity";

export class CharFileReader
  implements Exportable<{ fileName: string; data: string[][] }>
{
  private fileName: string;
  private extension: string;
  private fullPath: string;
  private filedata?: string[][];

  constructor(filePath: string) {
    const pathObj = path.parse(filePath);
    this.fileName = pathObj.base;
    this.extension = pathObj.ext;
    this.fullPath = path.join(process.cwd(), filePath);
  }

  get data() {
    if (!this.filedata) {
      return [];
    }
    return this.filedata;
  }

  public processFileData() {
    if (this.extension !== ".csv") {
      return;
    }

    const fileData = fs.readFileSync(this.fullPath, { encoding: "utf-8" });
    const rows = fileData.split("\n");
    const rowArray: string[][] = rows.map((row) => {
      const values = row.split(",").map((item) => item.replace(/[/\r]/g, ""));
      return values;
    });
    this.filedata = rowArray;
  }

  public export() {
    return {
      fileName: this.fileName,
      data: [...this.data],
    };
  }
}
