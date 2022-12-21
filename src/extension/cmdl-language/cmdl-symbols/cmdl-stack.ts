/**
 * Stack data structure for handling model activation records or symbol table scopes during compilation
 *
 */
export class CmdlStack<T> {
  private _records: T[] = [];

  get size() {
    return this._records.length;
  }

  public isEmpty() {
    return this._records.length === 0;
  }

  public push(record: T) {
    this._records.push(record);
  }

  public pop() {
    return this._records.pop();
  }

  public peek() {
    return this._records[this._records.length - 1];
  }

  public print() {
    //print stack
  }
}
