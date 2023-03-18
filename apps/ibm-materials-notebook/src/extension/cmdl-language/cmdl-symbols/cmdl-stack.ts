/**
 * Stack data structure for handling model activation records or symbol table scopes during compilation
 *
 */
export class CmdlStack<T> {
  private _records: T[] = [];

  /**
   * Retrieves the current size of the stack
   */
  get size(): number {
    return this._records.length;
  }

  /**
   * Returns whether or not stack is empty
   * @returns boolean
   */
  public isEmpty(): boolean {
    return this._records.length === 0;
  }

  /**
   * Adds record to the stack
   * @param record T
   */
  public push(record: T): void {
    this._records.push(record);
  }

  /**
   * Removes and returns top record from stack
   * @returns T | undefined
   */
  public pop(): T | undefined {
    return this._records.pop();
  }

  /**
   * Returns top record from the stack
   * @returns T
   */
  public peek(): T {
    return this._records[this._records.length - 1];
  }

  /**
   * Converts stack to string for printing to console.
   */
  public print() {
    //print stack
    throw new Error(`Not implemented!`);
  }
}
