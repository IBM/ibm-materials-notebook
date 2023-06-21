import { BaseError } from "./errors";

export class DiagnosticManager {
  private _documents = new Map<string, ErrorTable>();

  public get(uri: string) {
    const documentErrors = this._documents.get(uri);
    if (!documentErrors) {
      throw new Error(`Error table not availabe for document: ${uri}`);
    }
    return documentErrors;
  }
  public create(namespace: string): ErrorTable {
    let newTable = new ErrorTable();
    this._documents.set(namespace, newTable);
    return newTable;
  }

  public delete(namespace: string) {
    if (this._documents.has(namespace)) {
      this._documents.delete(namespace);
    }
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
    let currentErrs = this._expErrors.get(uri);
    if (!currentErrs) {
      this._expErrors.set(uri, errors);
    } else {
      let newErrors = [...currentErrs, ...errors];
      this._expErrors.set(uri, newErrors);
    }
  }

  /**
   * Gets errors for a given cell, returns an empty array if none.
   * @param uri string - cell uri
   * @returns BaseError[]
   */
  public get(uri: string): BaseError[] {
    let errors = this._expErrors.get(uri);

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
    let output: Record<string, BaseError[]> = {};

    for (const [key, value] of this._expErrors.entries()) {
      output[key] = value;
    }

    return output;
  }
}
