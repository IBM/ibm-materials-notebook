import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { logger } from "../logger";
import { ModelType } from "./cmdl-language/cmdl-types/groups/group-types";

interface BaseReference {
  name: string;
  type: ModelType;
}

/**
 * Interface with VS Code Memento class for local storage
 */
class LocalStorageService {
  constructor(private storage: vscode.Memento) {}

  /**
   * Retrieves all keys currently exiting in storage
   * @returns string[]
   */
  public getKeys(): readonly string[] {
    return this.storage.keys();
  }

  /**
   * Retrieves value from storage by value
   * @param key string
   * @returns T | undefined
   */
  public getValue<T>(key: string): T | undefined {
    const value = this.storage.get<T>(key);

    if (!value) {
      return undefined;
    }

    return value;
  }

  /**
   * Determines if entity exists already in storage
   * @param key string
   * @returns boolean
   */
  public hasValue(key: string): boolean {
    const value = this.storage.get(key);

    if (!value) {
      return false;
    }

    return true;
  }

  /**
   * Sets value to storage
   * @TODO check if value exists already in storage
   * @param key string
   * @param value T
   */
  public setValue<T>(key: string, value: T): void {
    //add separate method to check duplication for global values
    this.storage.update(key, value);
  }

  /**
   * Clears all values from storage
   */
  public clear() {
    const keys = this.getKeys();

    for (const key of keys) {
      this.storage.update(key, undefined);
    }
  }
}

/**
 * Manages entities which may be imported into CMDL notebook documents
 * Saves entities generated in experiments to workspaceStorage.
 */
export class Library {
  private workspaceStorage: LocalStorageService;
  private globalStorage: LocalStorageService;
  private libPath: string;

  constructor(context: vscode.ExtensionContext, wsLibPath: string) {
    this.libPath = wsLibPath;
    this.workspaceStorage = new LocalStorageService(context.workspaceState);
    this.globalStorage = new LocalStorageService(context.globalState);

    logger.debug(`workspaceUri: ${context.storageUri?.fsPath}`);
  }

  /**
   * Parses JSON files from lib folder of workspace directory and saves them to
   * workspace storage.
   * @TODO ensure clearing of stale values
   */
  public async initialize(): Promise<void> {
    const basePath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.path
      : __dirname;
    const resolvedPath = path.join(basePath, "lib");

    await this.readLibDir(resolvedPath, "workspace");
  }

  /**
   * Reads file directory and parses all files into storage for importing items
   * @param path string
   */
  private async readLibDir(
    path: string,
    level: "workspace" | "extension"
  ): Promise<void> {
    logger.info(`Initializing library on path ${path}`);
    fs.readdir(path, async (err, files) => {
      if (err) {
        logger.error(
          `Encountered an error during library initialization for path ${path}: ${err.message}`
        );
      } else {
        for (const file of files) {
          try {
            const readfile = await fs.promises.readFile(`${path}/${file}`, {
              encoding: "utf8",
            });
            const contents = JSON.parse(readfile);
            for (const item of contents) {
              if (level === "extension") {
                this.globalStorage.setValue(item.name, item);
              } else {
                this.workspaceStorage.setValue(item.name, item);
              }
            }
          } catch (error) {
            logger.warn(`Unable to initialize library contents from ${file}`);
          }
        }
      }
    });
  }

  /**
   * Retrieves a item to import into a notebook document
   * @param key string
   * @returns BaseReference | undefined
   */
  public getItem(key: string): BaseReference | undefined {
    if (
      this.workspaceStorage.hasValue(key) &&
      this.globalStorage.hasValue(key)
    ) {
      logger.warn(
        `Both global and workspace storage has entry for ${key}, returning workspace value...`
      );
      return this.workspaceStorage.getValue<BaseReference>(key);
    } else if (this.workspaceStorage.hasValue(key)) {
      return this.workspaceStorage.getValue<BaseReference>(key);
    } else {
      return this.globalStorage.getValue<BaseReference>(key);
    }
  }

  /**
   * Adds item to library
   * @param item EntityReference
   * @TODO ensure clearing of stale values
   */
  public addItem(item: any): void {
    if (this.workspaceStorage.hasValue(item.name)) {
      logger.warn(`Overwriting value for ${item.name} in repo library...`);
    }

    this.workspaceStorage.setValue(item.name, item);
  }

  /**
   * Searches library based on string query
   * @param query string
   * @returns BaseReference[]
   */
  public search(query: string): BaseReference[] {
    logger.silly(`searching storage for ${query}`);
    const regex = new RegExp(query, "i");
    let results = [];

    for (const key of this.workspaceStorage.getKeys()) {
      let containsQuery = regex.test(key);
      let item = this.workspaceStorage.getValue<BaseReference>(key);
      if (containsQuery && item) {
        results.push(item);
      }
    }

    for (const key of this.globalStorage.getKeys()) {
      let containsQuery = regex.test(key);
      let item = this.globalStorage.getValue<BaseReference>(key);
      if (containsQuery && item) {
        results.push(item);
      }
    }

    logger.debug(
      `search results: \n${results.map((el) => el.name).join("\n- ")}`
    );

    return results;
  }
}
