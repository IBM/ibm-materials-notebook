/**
 * Stack data structure for handling model activation records or symbol table scopes during compilation
 *
 */
export class CmdlStack<T> {
  private _records: T[] = [];

  get size() {
    return this._records.length;
  }

  /**
   * Returns whether or not stack is empty
   * @returns boolean
   */
  public isEmpty() {
    return this._records.length === 0;
  }

  /**
   * Adds record to the stack
   * @param record T
   */
  public push(record: T) {
    this._records.push(record);
  }

  /**
   * Removes and returns top record from stack
   * @returns T
   */
  public pop() {
    return this._records.pop();
  }

  /**
   * Returns top record from the stack
   * @returns T
   */
  public peek() {
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
