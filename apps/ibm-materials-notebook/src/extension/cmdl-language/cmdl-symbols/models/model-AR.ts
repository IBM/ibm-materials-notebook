import { cmdlLogger as logger } from "../../logger";

/**
 * Activation record for managing computed model values and properties for each scope
 */
export class ModelActivationRecord {
  name: string;
  type: string;
  uri: string;
  private properties = new Map<string, any>();

  constructor(type: string, name: string, uri: string) {
    this.type = type;
    this.uri = uri;
    this.name = name;
  }

  /**
   * Method to compile values into an array on the AR. Creates an array if does not exist.
   * @param key string
   * @param value any - item to be merged into an array
   */
  public mergeArrayValue(key: string, value: any) {
    let arrayValues = this.properties.get(key);

    if (arrayValues) {
      arrayValues.push(value);
    } else {
      this.properties.set(key, [value]);
    }
  }

  /**
   * Sets a single property on the AR
   * @param key string
   * @param value any
   */
  public setValue(key: string, value: any) {
    this.properties.set(key, value);
  }

  /**
   * Attempts to retrieve a property on the AR. Throws an error if undefined.
   * @param key string
   * @returns any
   */
  public getValue(key: string) {
    const property = this.properties.get(key);

    if (!property) {
      throw new Error(
        `unable to locate ${key} on activation record ${this.name}`
      );
    }

    return property;
  }

  /**
   * Attempts to retrieve a property on the AR. Returns undefined if not found.
   * @param key string
   * @returns any
   */
  public getOptionalValue(key: string) {
    return this.properties.get(key);
  }

  /**
   * Returns iterator for entries of the AR.
   * @returns [IterableIterator]
   */
  public all() {
    return this.properties.entries();
  }

  /**
   * Returns iterator for values of the AR.
   * @returns [IterableIterator]
   */
  public values() {
    return this.properties.values();
  }

  /**
   * Converts AR into a string for logging purposes
   * @returns string
   */
  public print() {
    const header = `Activation Record: ${this.name}\ntype:${this.type}\nURI: ${this.uri}\n------------`;

    let body = ``;

    for (const [key, value] of this.properties) {
      body = body + "\n" + `${key}: ${JSON.stringify(value, null, 2)}`;
    }

    return header + "\n" + body;
  }
}

/**
 * Facade class for global memory which proxies all inherited methods to ModelARManager
 */
class GlobalActivationRecord extends ModelActivationRecord {
  manager: ModelARManager;
  constructor(
    type: string,
    name: string,
    uri: string,
    manager: ModelARManager
  ) {
    super(type, name, uri);
    this.manager = manager;
  }

  public mergeArrayValue(key: string, value: any): void {
    this.manager.mergeArrayValue(this.uri, key, value);
  }

  public getValue(key: string) {
    return this.manager.getValue(key);
  }

  public getOptionalValue(key: string) {
    return this.manager.getOptionalValue(key);
  }

  public setValue(key: string, value: any): void {
    this.manager.setValue(this.uri, key, value);
  }

  public print(): string {
    return this.manager.print();
  }

  public all() {
    logger.warn(
      `getting all values from globalAR! Returning empty iterator...`
    );
    return new Map().entries();
  }
}

/**
 * Manages global AR for each cell. Creates a proxy class for use as global AR during model evaluation.
 */
export class ModelARManager {
  private records = new Map<string, ModelActivationRecord>();

  constructor(public uri: string) {}

  /**
   * Creates global AR proxy to ModelARManager. Used as global memory during model tabulation/execution.
   * @param cellUri string
   * @returns GlobalActivationRecord
   */
  public createGlobalAR(cellUri: string) {
    const cellAR = new ModelActivationRecord("cellAR", "cellAR", cellUri);
    this.records.set(cellUri, cellAR);

    const globalAR = new GlobalActivationRecord(
      "GLOBAL",
      "GLOBAL",
      cellUri,
      this
    );

    return globalAR;
  }

  /**
   * Retrieves an AR for a cell based on its URI string. Throws an error if undefined.
   * @param uri string
   * @returns ModelActivationRecord
   */
  public getRecord(uri: string) {
    const record = this.records.get(uri);

    if (!record) {
      throw new Error(`unable to locate cell AR ${uri}`);
    }

    return record;
  }

  /**
   * Deletes an AR based off of a cells URI string.
   * @param uri string
   */
  public deleteRecord(uri: string) {
    this.records.delete(uri);
  }

  /**
   * Converts all cell AR's to strings for logging.
   * @returns string
   */
  public print(): string {
    let printOut = "";

    for (const modelAR of this.records.values()) {
      printOut = printOut + "\n" + modelAR.print();
    }
    return printOut;
  }

  /**
   * Helper method to search all AR for a value
   * @param key string
   * @returns any
   */
  private searchRecords(key: string) {
    for (const record of this.records.values()) {
      let value = record.getOptionalValue(key);

      if (value) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Searches all cell AR's for value, throws an error if undefined.
   * @param key string
   * @returns any
   */
  public getValue(key: string) {
    const value = this.searchRecords(key);

    if (!value) {
      throw new Error(`Unable to locate ${key}`);
    }

    return value;
  }

  /**
   * Searches all cell AR's for value, returns undefined if not found.
   * @param key string
   * @returns any
   */
  public getOptionalValue(key: string) {
    return this.searchRecords(key);
  }

  /**
   * Sets a single value on a cells AR.
   * @param uri string
   * @param key string
   * @param values any
   */
  public setValue(uri: string, key: string, values: any) {
    const record = this.getRecord(uri);
    record.setValue(key, values);
  }

  /**
   * Merges a single item into an array value on a cell AR. Creates a new array if not found.
   * @param uri string
   * @param key string
   * @param values any
   */
  public mergeArrayValue(uri: string, key: string, values: any) {
    const record = this.getRecord(uri);
    record.mergeArrayValue(key, values);
  }

  /**
   * Creates an array of cell AR values.
   * @returns any[]
   */
  public all() {
    let allValues: any[] = [];

    for (const record of this.records.values()) {
      for (const [key, value] of record.all()) {
        allValues.push(value);
      }
    }

    return allValues;
  }
}
