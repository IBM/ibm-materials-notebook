/**
 * Activation record for managing computed model values and properties for each scope
 */
export class ActivationRecord {
  private properties = {} as Record<string, unknown>;

  constructor(public name: string, public uri: string) {}

  /**
   * Method to compile values into an array on the AR. Creates an array if does not exist.
   * @param key string
   * @param value T - item to be merged into an array
   */
  public mergeArrayValue(key: string, value: unknown) {
    const arrayValues = this.properties[key];

    if (Array.isArray(arrayValues)) {
      arrayValues.push(value);
    } else {
      this.properties[key] = [value];
    }
  }

  /**
   * Sets a single property on the AR
   * @param key string
   * @param value any
   */
  public setValue(key: string, value: unknown) {
    this.properties[key] = value;
  }

  /**
   * Attempts to retrieve a property on the AR. Throws an error if undefined.
   * @param key K
   * @returns T[K]
   */
  public getValue<T>(key: string) {
    const property = this.properties[key];

    if (!property) {
      throw new Error(
        `unable to locate ${key as string} on activation record ${this.name}`
      );
    }

    return property as T;
  }

  /**
   * Attempts to retrieve a property on the AR. Returns undefined if not found.
   * @param key string
   * @returns T[K]
   */
  public getOptionalValue<T>(key: string) {
    const property = this.properties[key];

    if (!property) {
      return undefined;
    }

    return property as T;
  }

  /**
   * Returns iterator for entries of the AR.
   * @returns [IterableIterator]
   */
  public all() {
    return Object.entries(this.properties);
  }

  /**
   * Returns iterator for values of the AR.
   * @returns [IterableIterator]
   */
  public values() {
    return Object.values(this.properties);
  }

  /**
   * Converts AR into a string for logging purposes
   * @returns string
   */
  public print() {
    const header = `Activation Record: ${this.name}\nURI: ${this.uri}\n------------`;

    let body = ``;

    for (const key in this.properties) {
      body =
        body +
        "\n" +
        `${key}: ${JSON.stringify(this.properties[key], null, 2)}`;
    }

    return header + "\n" + body;
  }
}

/**
 * Facade class for global memory which proxies all inherited methods to ModelARManager
 */
class GlobalActivationRecord extends ActivationRecord {
  manager: ActivationRecordTable;
  constructor(name: string, uri: string, manager: ActivationRecordTable) {
    super(name, uri);
    this.manager = manager;
  }

  public mergeArrayValue(key: string, value: unknown): void {
    this.manager.mergeArrayValue(this.uri, key, value);
  }

  public getValue<T>(key: string) {
    return this.manager.getValue<T>(key);
  }

  public getOptionalValue<T>(key: string) {
    return this.manager.getOptionalValue<T>(key);
  }

  public setValue(key: string, value: unknown): void {
    this.manager.setValue(this.uri, key, value);
  }

  public print(): string {
    return this.manager.print();
  }
}

/**
 * Manages activation records for each document. Creates a proxy class for use as global AR during model evaluation.
 */
export class ActivationRecordTable {
  private records = new Map<string, ActivationRecord>();

  constructor(public fileName: string) {}

  /**
   * Creates global AR proxy to ModelARManager. Used as global memory during model tabulation/execution.
   * @param uri string
   * @returns GlobalActivationRecord
   */
  public createGlobalAR(uri: string): GlobalActivationRecord {
    const cellAR = new ActivationRecord("cellAR", uri);
    this.records.set(uri, cellAR);
    const globalAR = new GlobalActivationRecord("GLOBAL", uri, this);

    return globalAR;
  }

  /**
   * Retrieves an AR for a cell based on its URI string. Throws an error if undefined.
   * @param uri string
   * @returns ActivationRecord
   */
  public getRecord(uri: string): ActivationRecord {
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
  public deleteRecord(uri: string): void {
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
   * @returns T
   */
  private searchRecords<T>(key: string): NonNullable<T> | undefined {
    for (const record of this.records.values()) {
      const value = record.getOptionalValue<T>(key);

      if (value) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Searches all cell AR's for value, throws an error if undefined.
   * @param key string
   * @returns T
   */
  public getValue<T>(key: string): T {
    const value = this.searchRecords<T>(key);

    if (!value) {
      throw new Error(`Unable to locate ${key}`);
    }

    return value;
  }

  /**
   * Searches all cell AR's for value, returns undefined if not found.
   * @param key string
   * @returns T | undefined
   */
  public getOptionalValue<T>(key: string): T | undefined {
    const value = this.searchRecords<T>(key);

    if (!value) {
      return undefined;
    }

    return value;
  }

  /**
   * Sets a single value on a cells AR.
   * @param uri string
   * @param key string
   * @param values any
   */
  public setValue(uri: string, key: string, values: unknown): void {
    const record = this.getRecord(uri);
    record.setValue(key, values);
  }

  /**
   * Merges a single item into an array value on a cell AR. Creates a new array if not found.
   * @param uri string
   * @param key string
   * @param values any
   */
  public mergeArrayValue(uri: string, key: string, values: unknown): void {
    const record = this.getRecord(uri);
    record.mergeArrayValue(key, values);
  }

  /**
   * Creates an array of cell AR values.
   * @returns T[]
   */
  public all<T>(): T[] {
    const allValues: T[] = [];

    for (const record of this.records.values()) {
      for (const value of record.values()) {
        allValues.push(value as T);
      }
    }

    return allValues;
  }
}
