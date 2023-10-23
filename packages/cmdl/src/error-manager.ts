import { BaseError } from "./errors";

export class DiagnosticManager {
  private _tables = new Map<string, ErrorTable>();

  public get(uri: string) {
    const documentErrors = this._tables.get(uri);
    if (!documentErrors) {
      throw new Error(`Error table not availabe for document: ${uri}`);
    }
    return documentErrors;
  }
  public create(namespace: string): ErrorTable {
    const newTable = new ErrorTable();
    this._tables.set(namespace, newTable);
    return newTable;
  }

  public delete(namespace: string) {
    if (this._tables.has(namespace)) {
      this._tables.delete(namespace);
    }
  }

  public print() {
    const header = `Error Tables\n---------------`;
    let main = ``;
    for (const table of this._tables.keys()) {
      main = `${main}\n${table}`;
    }

    return `${header}${main}`;
  }
}

/**
 * Manages errors for each cell in notebook
 */
export class ErrorTable {
  private _expErrors = new Map<string, BaseError[]>();

  /**
   * Adds an error for a given cell
   * @param uri string - cell uri
   * @param errors BaseError[]
   */
  public add(uri: string, errors: BaseError[]): void {
    const currentErrs = this._expErrors.get(uri);
    if (!currentErrs) {
      this._expErrors.set(uri, errors);
    } else {
      const newErrors = [...currentErrs, ...errors];
      this._expErrors.set(uri, newErrors);
    }
  }

  /**
   * Gets errors for a given cell, returns an empty array if none.
   * @param uri string - cell uri
   * @returns BaseError[]
   */
  public get(uri: string): BaseError[] {
    const errors = this._expErrors.get(uri);

    if (!errors) {
      return [];
    }

    return errors;
  }

  /**
   * Deletes all errors for a given cell.
   * @param uri string - cell uri
   */
  public delete(uri: string): void {
    this._expErrors.delete(uri);
  }

  /**
   * Retrieves all errors for notebook document
   * @returns BaseError[]
   */
  public all(): BaseError[] {
    let allErrors: BaseError[] = [];

    for (const cellErrors of this._expErrors.values()) {
      allErrors = allErrors.concat(cellErrors);
    }
    return allErrors;
  }

  /**
   * Serializes error table to an object for logging.
   * @returns Record<string, BaseError[]>
   */
  public print(): Record<string, BaseError[]> {
    const output: Record<string, BaseError[]> = {};

    for (const [key, value] of this._expErrors.entries()) {
      output[key] = value;
    }

    return output;
  }
}
