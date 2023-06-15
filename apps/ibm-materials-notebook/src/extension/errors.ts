import { CMDLErrors } from "cmdl";

/**
 * Manages errors for each cell in notebook
 */
export class ErrorTable {
  private _expErrors = new Map<string, CMDLErrors.BaseError[]>();

  /**
   * Adds an error for a given cell
   * @param uri string - cell uri
   * @param errors CMDLErrors.BaseError[]
   */
  public add(uri: string, errors: CMDLErrors.BaseError[]): void {
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
   * @returns CMDLErrors.BaseError[]
   */
  public get(uri: string): CMDLErrors.BaseError[] {
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
   * @returns CMDLErrors.BaseError[]
   */
  public all(): CMDLErrors.BaseError[] {
    let allErrors: CMDLErrors.BaseError[] = [];

    for (const cellErrors of this._expErrors.values()) {
      allErrors = allErrors.concat(cellErrors);
    }
    return allErrors;
  }

  /**
   * Serializes error table to an object for logging.
   * @returns Record<string, CMDLErrors.BaseError[]>
   */
  public print(): Record<string, CMDLErrors.BaseError[]> {
    let output: Record<string, CMDLErrors.BaseError[]> = {};

    for (const [key, value] of this._expErrors.entries()) {
      output[key] = value;
    }

    return output;
  }
}
