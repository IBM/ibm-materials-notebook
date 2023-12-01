import { RefError } from "./errors";
import { logger } from "./logger";
import { ReferenceSymbol, SymbolTable } from "./symbols";

export class SymbolTableManager {
  private readonly _tables = new Map<string, SymbolTable>();

  /**
   * Method to get a symbol table for a file. Throws an error if undefined
   * @param fileName name of file associated with symbol table
   * @returns SymbolTable
   */
  public get(fileName: string): SymbolTable {
    const table = this._tables.get(fileName);

    if (!table) {
      throw new Error(`Symbol table for ${fileName} is not defined`);
    }

    return table;
  }

  /**
   * Method to lookup symbols in a given file
   * @param fileName file name to look up
   * @param path path of symbol
   * @returns BaseSymbol[] | undefined
   */
  public lookupMembers(fileName: string, path: string[]) {
    const sourceTable = this.get(fileName);
    return sourceTable.getSymbolMembers(path);
  }

  /**
   * Method to lookup declarations
   * @param fileName file name to look up declarations
   * @returns BaseSymbol[]
   */
  public lookupDeclarations(fileName: string) {
    const sourceTable = this.get(fileName);
    return sourceTable.getDeclaredEntities();
  }

  /**
   * Method for looking up reference in a file
   * @param fileName file name to lookup reference from
   * @param symbol Reference symbol
   * @returns RefError | undefined
   */
  public lookupReference(fileName: string, symbol: ReferenceSymbol) {
    try {
      const sourceTable = this.get(fileName);
      return sourceTable.lookup(symbol, sourceTable);
    } catch (error) {
      logger.error(
        `Error looking up reference ${symbol.name} in ${fileName}:\n${error}`
      );
      return new RefError(
        `Compiler error in finding ${symbol.name}`,
        symbol.token
      );
    }
  }

  /**
   * Method for creating a new symbol table
   * @param fileName file name to create a symbol table for
   * @returns SymbolTable
   */
  public create(fileName: string) {
    const newTable = new SymbolTable(fileName, this);
    this._tables.set(fileName, newTable);
    return newTable;
  }

  /**
   * Method for removing a symbol table
   * @param fileName file name to remove symbol table
   */
  public remove(fileName: string) {
    this._tables.delete(fileName);
  }

  /**
   * Method for logging members of a given symbol table
   * @returns string
   */
  public print(): string {
    const text = `Symbol table manager\n---------------\n\nTables:\n`;
    const tables = [...this._tables.keys()].join(`\n\t-`);
    return `${text}${tables}`;
  }
}
