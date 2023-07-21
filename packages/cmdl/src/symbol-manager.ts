import { SymbolTable } from "./symbols";

//!TODO enable cross-namespace lookups for symbol refs
export class SymbolTableManager {
  private readonly _tables = new Map<string, SymbolTable>();

  public getTable(namespace: string): SymbolTable {
    const table = this._tables.get(namespace);
    if (!table) {
      throw new Error(`Symbol table for ${namespace} is not defined`);
    }

    return table;
  }

  public lookupMembers(namespace: string, path: string[]) {
    const sourceTable = this.getTable(namespace);
    return sourceTable.getSymbolMembers(path);
  }

  public lookupDeclarations(namespace: string) {
    const sourceTable = this.getTable(namespace);
    return sourceTable.getDeclaredEntities();
  }

  public create(namespace: string) {
    const newTable = new SymbolTable(namespace, this);
    this._tables.set(namespace, newTable);
    return newTable;
  }

  public remove(namespace: string) {
    this._tables.delete(namespace);
  }
}
