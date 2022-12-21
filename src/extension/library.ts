import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { logger } from "../logger";

interface BaseReference {
  name: string;
  type:
    | "chemical"
    | "polymer"
    | "fragment"
    | "complex"
    | "polymer_graph"
    | "reactor_graph";
  state: "solid" | "liquid" | "gas";
}

interface LibraryChemical extends BaseReference {
  molecular_weight: any;
  density?: any;
  smiles: string;
}

interface LibraryMaterial extends BaseReference {
  mn_avg: any;
  dispersity: any;
  graph: any;
}

interface LibraryPolymerGraph extends BaseReference {
  graph: any;
  tree: any;
}

interface LibraryReactorGraph extends BaseReference {
  nodes: any[];
  edges: any[];
  outputNode: string;
  reactors: any[];
}

/**
 * Manages entities which may be imported into CMDL notebook documents
 */
export class Library {
  private readonly _collection = new Map<string, BaseReference>();
  private readonly _exp_collection = new Map<string, BaseReference>();
  expPath?: string;
  libPath?: string;

  /**
   * Retrieves a item to import into a notebook document
   * @param key string
   * @returns BaseReference | undefined
   */
  public getItem(key: string) {
    if (this._collection.has(key) && this._exp_collection.has(key)) {
      throw new Error(`name collusion in library: ${key}`);
    }

    if (this._collection.has(key)) {
      return this._collection.get(key);
    } else if (this._exp_collection.has(key)) {
      return this._exp_collection.get(key);
    } else {
      return undefined;
    }
  }

  /**
   * Adds item to library
   * @param item any
   */
  public addItem(item: any) {
    if (this._exp_collection.has(item.name)) {
      logger.warn(`Overwriting value for ${item.name} in repo library...`);
    }

    this._exp_collection.set(item.name, item);
  }

  /**
   * Searches library based on string query
   * @param query string
   * @returns BaseReference[]
   */
  public search(query: string) {
    const regex = new RegExp(query, "i");
    let results = [];

    for (const key of this._collection.keys()) {
      let containsQuery = regex.test(key);
      let item = this._collection.get(key);
      if (containsQuery && item) {
        results.push(item);
      }
    }

    for (const key of this._exp_collection.keys()) {
      let containsQuery = regex.test(key);
      let item = this._exp_collection.get(key);
      if (containsQuery && item) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Initializes one of the collections for the Library
   * @param libPath path to library items
   * @param collection exp | lib collection being initialized
   */
  async initLibrary(libPath: string, collection: "exp" | "lib") {
    logger.info(`Initializing library...`);

    if (collection === "lib") {
      this.libPath = libPath;
    } else {
      this.expPath = libPath;
    }

    const basePath = vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.path
      : __dirname;
    const resolvedPath = path.join(basePath, libPath);
    // logger.debug(`full library path:\n${resolvedPath}`);

    fs.readdir(resolvedPath, async (err, files) => {
      if (err) {
        logger.error(
          `Encountered an error during library initialization: ${err.message}`
        );
      } else {
        for (const file of files) {
          try {
            const readfile = await fs.promises.readFile(
              `${resolvedPath}/${file}`,
              {
                encoding: "utf8",
              }
            );
            const contents = JSON.parse(readfile);

            if (collection === "lib") {
              this.libPath = libPath;
              contents.forEach((item: any) => {
                this._collection.set(item.name, item);
              });
            } else {
              this.expPath = libPath;
              contents.forEach((item: any) => {
                this._exp_collection.set(item.name, item);
              });
            }
          } catch (error) {
            logger.warn(`Unable to initialize library contents from ${file}`);
          }
        }
      }
    });
    logger.verbose(`...finished library initialization`);
  }
}
