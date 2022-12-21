import * as fs from "fs";
import * as path from "path";

/**
 * Handles imports from other files into notebook documents
 * @deprecated
 */
class ImportManager {
  public async fileExists(filePath: string) {
    try {
      const resolvedPath = path.join(__dirname, filePath);
      await fs.promises.access(resolvedPath);
      return true;
    } catch (error) {
      return false;
    }
  }

  public async readFile(filePath: string) {
    const resolvedPath = path.join(__dirname, filePath);
    const readfile = await fs.promises.readFile(resolvedPath, {
      encoding: "utf8",
    });

    return readfile;
  }
}
export const importManager = new ImportManager();
