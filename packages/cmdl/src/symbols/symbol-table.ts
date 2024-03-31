import { RefError } from "../errors/errors";
import { CMDLNode } from "../cmdl-tree";
import { ErrorTable } from "../errors/error-manager";

/**
 * Enum specfiying the different symbol types within CMDL
 */
export enum SymbolType {
  ASSIGN = "ASSIGNMENT",
  PROPERTY = "PROPERTY",
  GRAPH = "GRAPH",
  EDGE = "EDGE",
  RECORD = "RECORD",
  REFERENCE = "REFERENCE",
  COLLECTION = "COLLECTION",
  IMPORT = "IMPORT",
}

/**
 * Interface for defining an AST visitor
 */
export interface AstVisitor {
  visit(arg: CMDLNode): void;
}

/**
 * Interface for CMDL symbol configuraton
 */
export interface CMDLSymbol {
  name: string;
  alias?: string;
  path?: string[];
  symbolType: SymbolType;
  valueType: string;
  scope: string;
  uri: string;
}

/**
 * Manages symbols for a particular scope
 */
export class SymbolTable {
  scope: string;
  uri: string;
  enclosingScope: SymbolTable | null;
  nestedScopes: SymbolTable[] = [];
  readonly _symbols = new Map<string, CMDLSymbol>();

  constructor(
    scope: string,
    uri: string,
    parentScope: SymbolTable | null = null
  ) {
    this.scope = scope;
    this.uri = uri;
    this.enclosingScope = parentScope;
    parentScope?.nestedScopes.push(this);
  }

  /**
   * Adds new nested scope to table and sets table as enclosing scope
   * for new nested table
   * @param table SymbolTable
   */
  public addNestedScope(table: SymbolTable): void {
    table.enclosingScope = this;
    this.nestedScopes.push(table);
  }

  /**
   * Adds a new symbol to the symbol table
   * @param id string
   * @param symbol BaseSymbol
   */
  public add(symbol: CMDLSymbol): void {
    this._symbols.set(symbol.name, symbol);
  }

  /**
   * Returns whether or not symbol exists in table
   * @param id key
   * @returns boolean
   */
  public has(id: string): boolean {
    return this._symbols.has(id);
  }

  /**
   * Retrieves a symbol from the table, throws an error if not found
   * @param id string
   * @returns BaseSymbol
   */
  public get(id: string): CMDLSymbol {
    const symbol = this._symbols.get(id);

    if (!symbol) {
      throw new RefError(`${id} is not defined on ${this.scope}`);
    }

    return symbol;
  }

  /**
   * Helper method to recursively access a global scope symbol
   * @deprecated
   * @param id string
   * @returns SymbolTable | undefined
   */
  public getGlobalScopeSym(id: string): SymbolTable | undefined {
    if (this.enclosingScope) {
      return this.enclosingScope.getGlobalScopeSym(id);
    } else if (!this.enclosingScope && this.has(id)) {
      return this;
    } else {
      return;
    }
  }

  /**
   * Retrieves a nested scope by string value, throws an error if not found
   * @rename to getScope
   * @param scope string
   * @returns SymbolTable
   */
  public getNestedScope(scope: string): SymbolTable {
    const nestedScope = this.nestedScopes.find((el) => el.scope === scope);

    if (!nestedScope) {
      throw new RefError(`scope ${scope} is not defined on ${this.scope}`);
    }

    return nestedScope;
  }

  /**
   * Gets all the symbols defined for a given cell
   * ?deprecated
   * @param uri string - Cell uri
   * @returns CMDLSymbol[]
   */
  public getByUri(uri: string): CMDLSymbol[] {
    const cellSymbols: CMDLSymbol[] = [];

    for (const symbol of this._symbols.values()) {
      if (symbol.uri === uri) {
        cellSymbols.push(symbol);
      }
    }

    return cellSymbols;
  }

  /**
   * Deletes all symbols and nested scopes from a given cell or document
   * @param uri string - Cell uri
   */
  public remove(uri: string): void {
    for (const symbol of this._symbols.values()) {
      if (symbol.uri === uri) {
        this.nestedScopes = this.nestedScopes.filter(
          (el) => el.scope !== symbol.name
        );

        this._symbols.delete(symbol.name);
      }
    }
  }

  /**
   * Retrieves all DeclarationSymbols or VariableDeclaration from current symbol table
   * @deprecated
   * @returns BaseSymbol[]
   */
  public getBaseSymbols(): CMDLSymbol[] {
    return [...this._symbols.values()];
  }

  /**
   * Retrieves all DeclarationSymbols from notebook. Excludes those imported from local storage
   * @deprecated
   * @returns BaseSymbol[]
   */
  public getDeclaredEntities(): CMDLSymbol[] {
    return [...this._symbols.values()];
  }

  /**
   * Retrieves array of symbol members of nested symbol table
   * @deprecated replace with single lookup function
   * @param path string[]
   * @returns BaseSymbol[]
   */
  public getSymbolMembers(path: string[]): CMDLSymbol[] | undefined {
    // const currentScope = path[0];
    // const newPath = path.slice(1);

    // if (!currentScope) {
    //   return;
    // }

    // const symbol = this._symbols.get(currentScope);

    // if (!symbol) {
    //   return;
    // }

    // if (symbol.type === SymbolType.IMPORT) {
    //   const sourcePath = (symbol as ImportSymbol).source.split("/");
    //   const fileName = sourcePath[sourcePath.length - 1];
    //   return this.manager.lookupMembers(fileName, path);
    // }

    // const scope = this.nestedScopes.find((el) => el.scope === currentScope);

    // if (!scope && symbol.type === SymbolType.REF_PROXY) {
    //   logger.debug(`Attempting to get members for proxy ${symbol.name}...`);
    //   if (this.enclosingScope) {
    //     return this.enclosingScope.getSymbolMembers(path);
    //   }
    //   return;
    // }

    // if (!scope) {
    //   return;
    // }

    // if (newPath.length) {
    //   return scope.getSymbolMembers(newPath);
    // }

    // return [...scope._symbols.values()].filter(
    //   (el) =>
    //     el.type === SymbolType.REF_PROXY || el.type === SymbolType.DECLARATION
    // );
    return [];
  }

  /**
   * Returns a list of symbol names based on a query. Used for completion providers.
   * @deprecated merge to one lookup
   * @rename to search
   * @param query string
   * @returns string[]
   */
  public find(query: string): string[] {
    if (!query.length) {
      return [...this._symbols.keys()];
    }

    const symbolKeys = [];

    for (const [key, value] of this._symbols.entries()) {
      if (value.symbolType !== SymbolType.REFERENCE) {
        symbolKeys.push(key);
      }
    }

    const regex = new RegExp(query);
    let scopeKeys = symbolKeys.filter((key) => regex.test(key));

    const nestedKeys = this.nestedScopes.map((el) => el.find(query)).flat();
    scopeKeys = scopeKeys.concat(nestedKeys);

    return scopeKeys;
  }

  /**
   * Validates existence of all references in document and their properties
   * @deprecated move to validator class
   * @param errTable ErrorTable
   * @param globalTable SymbolTable
   */
  public validate(errTable: ErrorTable, globalTable: SymbolTable): void {}

  /**
   * Helper method to recursively traverse symbol table to find referenced symbol
   * if symbol is found, passes the symbol path to the validate path method
   * @refactor merge with find method
   * @returns RefError | undefined
   */
  public lookup(name: string) {
    //check current scope, if not get enclosing scope until global scope is reached
    //if not found => not defined error
    //if found and no path return
    //if path => check path
  }

  /**
   * Helper method to validate path on nested scopes of a found symbol.
   * @param symbol ReferenceSymbol
   * @param path string[]
   * @returns RefError | undefined
   */
  private validateSymbolPath(path: string[], table: SymbolTable) {
    //check table nested scope recursively to find each item in path
    //throw not found error if item missing
  }

  /**
   * Converts symbol table to a string for logging purposes.
   * @todo implement interface
   * @returns string
   */
  public print(): string {
    const header = `Scope: ${this.scope}\nEnclosing: ${
      this.enclosingScope?.scope || null
    }\nNested: ${this.nestedScopes
      .map((el) => el.scope)
      .join(", ")}\n--------------\n`;

    let table = "Table:";
    for (const value of this._symbols.values()) {
      table = table + "\n" + `\t${value.name}`;
    }

    const footer = "\n-------------------\n";

    let full = `${header}${table}${footer}`;

    for (const childScope of this.nestedScopes) {
      full = full + "\n" + childScope.print();
    }

    return full;
  }
}
