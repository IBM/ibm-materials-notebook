import { BaseError } from "./cmdl-language/errors";

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
  add(uri: string, errors: BaseError[]) {
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
  get(uri: string) {
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
  delete(uri: string) {
    this._expErrors.delete(uri);
  }

  /**
   * Retrieves all errors for notebook document
   * @returns BaseError[]
   */
  all() {
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
  print() {
    let output: Record<string, BaseError[]> = {};

    for (const [key, value] of this._expErrors.entries()) {
      output[key] = value;
    }

    return output;
  }
}
