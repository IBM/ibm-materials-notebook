import { BaseError } from "./errors";

export class DiagnosticManager {
  private _tables = new Map<string, ErrorTable>();

  /**
   * Method to get error table for a file. Throws an
   * error if it does not exist.
   * @param fileName filename of error table to get
   * @returns
   */
  public get(fileName: string) {
    const documentErrors = this._tables.get(fileName);
    if (!documentErrors) {
      throw new Error(`Error table not availabe for document: ${fileName}`);
    }
    return documentErrors;
  }

  /**
   * Method for creating error table for a file.
   * @param fileName filename associated with error table
   * @returns
   */
  public create(fileName: string): ErrorTable {
    const newTable = new ErrorTable();
    this._tables.set(fileName, newTable);
    return newTable;
  }

  /**
   * Method for removing error tables
   * @param fileName name of error table to delete
   */
  public delete(fileName: string) {
    if (this._tables.has(fileName)) {
      this._tables.delete(fileName);
    }
  }

  /**
   * Method for printing current error tables
   * @returns string
   */
  public print(): string {
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
   * Adds errors for a given cell or text document
   * @param uri uri of cell or text document for errors
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
   * @param uri uri of cell or text document
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
   * @param uri uri of cell or text document
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
   * TODO: convert method to return a string instead of dict
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
