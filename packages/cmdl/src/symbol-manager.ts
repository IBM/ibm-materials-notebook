import { RefError } from "./errors";
import { logger } from "./logger";
import { ReferenceSymbol, SymbolTable } from "./symbols";

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

  public lookupReference(namespace: string, symbol: ReferenceSymbol) {
    try {
      const sourceTable = this.getTable(namespace);
      return sourceTable.lookup(symbol, sourceTable);
    } catch (error) {
      logger.error(
        `Error looking up reference ${symbol.name} in ${namespace}:\n${error}`
      );
      return new RefError(`Compiler error in finding ${symbol.name}`);
    }
  }

  public create(namespace: string) {
    const newTable = new SymbolTable(namespace, this);
    this._tables.set(namespace, newTable);
    return newTable;
  }

  public remove(namespace: string) {
    this._tables.delete(namespace);
  }

  public print() {
    const text = `Symbol table manager\n---------------\n\nTables:\n`;
    const tables = [...this._tables.keys()].join(`\n\t-`);
    return `${text}${tables}`;
  }
}
