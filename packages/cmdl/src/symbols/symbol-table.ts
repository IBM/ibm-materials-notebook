import { RefError, BaseError } from "../errors";
import { logger } from "../logger";
import {
  AngleSymbol,
  BaseSymbol,
  DeclarationSymbol,
  PropertySymbol,
  ReferenceSymbol,
  SymbolType,
} from "./cmdl-symbol-base";
import { RecordNode } from "../cmdl-tree";
import { TYPES } from "cmdl-types";
import { ErrorTable } from "../error-manager";

/**
 * Interface for defining an AST visitor
 */
export interface AstVisitor {
  visit(arg: RecordNode): void;
}

/**
 * Manages symbols for a particular scope
 */
export class SymbolTable {
  //! path?
  scope: string;
  enclosingScope: SymbolTable | null;
  nestedScopes: SymbolTable[] = [];
  readonly _symbols = new Map<string, BaseSymbol>();

  constructor(scope: string, parentScope: SymbolTable | null = null) {
    this.scope = scope;
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
  public add(id: string, symbol: BaseSymbol): void {
    this._symbols.set(id, symbol);
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
  public get(id: string): BaseSymbol {
    const symbol = this._symbols.get(id);

    if (!symbol) {
      throw new RefError(`${id} is not defined on ${this.scope}`);
    }

    return symbol;
  }

  /**
   * Helper method to recursively access a global scope symbole
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
   * Copies symbol tree for assiting in building nodes for graph objects (polymers, reactor graphs)
   * @param record CMDLNodeTree
   * @param base string
   */
  public copySymbolTree(record: TYPES.NodeTree, base?: string): void {
    if (!this.enclosingScope && base) {
      record[base] = {};
      const nestedScope = this.nestedScopes.find((el) => el.scope === base);

      if (!nestedScope) {
        return;
      }

      nestedScope.copySymbolTree(record[base]);
    } else {
      for (const currSymbol of this._symbols.keys()) {
        record[currSymbol] = {};
        const nestedScope = this.nestedScopes.find(
          (el) => el.scope === currSymbol
        );

        if (nestedScope) {
          nestedScope.copySymbolTree(record[currSymbol]);
        }
      }
    }
  }

  /**
   * Retrieves a nested scope by string value, throws an error if not found
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
   * @param uri string - Cell uri
   * @returns BaseSymbol[]
   */
  public getByUri(uri: string): BaseSymbol[] {
    const cellSymbols: BaseSymbol[] = [];

    for (const symbol of this._symbols.values()) {
      if (symbol.def === uri) {
        cellSymbols.push(symbol);
      }
    }

    return cellSymbols;
  }

  /**
   * Deletes all symbols and nested scopes from a given cell
   * @param uri string - Cell uri
   */
  public remove(uri: string): void {
    for (const symbol of this._symbols.values()) {
      if (symbol.def === uri) {
        this.nestedScopes = this.nestedScopes.filter(
          (el) => el.scope !== symbol.name
        );

        this._symbols.delete(symbol.name);
      }
    }
  }

  /**
   * Retrieves all DeclarationSymbols or VariableDeclaration from current symbol table
   * @returns BaseSymbol[]
   */
  public getBaseSymbols(): BaseSymbol[] {
    return [...this._symbols.values()].filter(
      (el) =>
        el.type === SymbolType.DECLARATION ||
        el.type === SymbolType.VARIABLE_DEC
    );
  }

  /**
   * Retrieves all DeclarationSymbols from notebook. Excludes those imported from local storage
   * @returns BaseSymbol[]
   */
  public getDeclaredEntities(): BaseSymbol[] {
    return [...this._symbols.values()].filter(
      (el) =>
        el.type === SymbolType.DECLARATION &&
        !(el as DeclarationSymbol).imported
    );
  }

  /**
   * Retrieves array of symbol members of nested symbol table
   * @todo - improve description
   * @param path string[]
   * @returns BaseSymbol[]
   */
  public getSymbolMembers(path: string[]): BaseSymbol[] | undefined {
    const currentScope = path[0];
    const newPath = path.slice(1);

    if (!currentScope) {
      return;
    }

    const scope = this.nestedScopes.find((el) => el.scope === currentScope);

    if (!scope) {
      return;
    }

    if (newPath.length) {
      return scope.getSymbolMembers(newPath);
    }

    return [...scope._symbols.values()].filter(
      (el) => el.type === SymbolType.REF_PROXY
    );
  }

  /**
   * Returns a list of symbol names based on a query. Used for completion providers.
   * @TODO Update method to examine nested scopes for symbols and properties
   * @param query string
   * @returns string[]
   */
  public find(query: string): string[] {
    if (!query.length) {
      return [...this._symbols.keys()];
    }

    const symbolKeys = [];

    for (const [key, value] of this._symbols.entries()) {
      if (value instanceof DeclarationSymbol) {
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
   * Retrieves all variable symbols
   * @todo - improve method description
   * @param value string
   * @returns PropertySymbol<any>
   */
  public findVarSymbol(value: string): PropertySymbol<any> | undefined {
    let queue: SymbolTable[] = [this];
    let curr: SymbolTable | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      for (const sym of curr._symbols.values()) {
        if (sym instanceof PropertySymbol && sym.value === value) {
          return sym;
        }
      }

      if (curr.nestedScopes.length) {
        curr.nestedScopes.forEach((scope) => {
          queue.push(scope);
        });
      }
    }
  }

  /**
   * Returns all symbols in current table
   * @deprecated
   * @returns IterableIterator<BaseSymbol>
   */
  public all(): IterableIterator<BaseSymbol> {
    return this._symbols.values();
  }

  /**
   * Clears current symbol table of symbols and nested scopes
   * @Deprecated
   */
  public clear(): void {
    this._symbols.clear();
    this.nestedScopes = [];
  }

  /**
   * Helper method to identify if a notebook has template variables
   * @returns boolean
   */
  public hasVariables(): boolean {
    let queue: SymbolTable[] = [this];
    let variableSymbols: BaseSymbol[] = [];

    let curr: SymbolTable | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      for (const sym of curr._symbols.values()) {
        if (
          sym.type === SymbolType.VARIABLE_DEC ||
          sym.type === SymbolType.VARIABLE_PROP
        ) {
          variableSymbols.push(sym);
        }
      }

      if (curr.nestedScopes.length) {
        curr.nestedScopes.forEach((scope) => {
          queue.push(scope);
        });
      }
    }
    return variableSymbols.length !== 0;
  }

  /**
   * Exports array of variables and their type to be written to a CSV template
   * @returns BaseSymbol[]
   */
  public exportVariables(): BaseSymbol[] {
    let queue: SymbolTable[] = [this];
    let variableSymbols: BaseSymbol[] = [];

    let curr: SymbolTable | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      for (const sym of curr._symbols.values()) {
        if (
          sym.type === SymbolType.VARIABLE_DEC ||
          sym.type === SymbolType.VARIABLE_PROP
        ) {
          variableSymbols.push(sym);
        }
      }

      if (curr.nestedScopes.length) {
        curr.nestedScopes.forEach((scope) => {
          queue.push(scope);
        });
      }
    }
    return variableSymbols;
  }

  /**
   * Validates existence of all references in document and their properties
   * @TODO validate variable properties and groups
   * @param errTable ErrorTable
   * @param globalTable SymbolTable
   */
  public validate(errTable: ErrorTable, globalTable: SymbolTable = this): void {
    for (const symbol of this._symbols.values()) {
      if (symbol instanceof ReferenceSymbol) {
        const referenceError = this.lookup(symbol, globalTable);

        if (referenceError) {
          errTable.add(symbol.def, [referenceError]);
        }
      } else if (
        symbol instanceof PropertySymbol &&
        symbol.value instanceof ReferenceSymbol
      ) {
        const refPropError = this.lookup(symbol.value, globalTable);

        if (refPropError) {
          errTable.add(symbol.def, [refPropError]);
        }
      } else if (
        symbol instanceof PropertySymbol &&
        Array.isArray(symbol.value) &&
        symbol.value[0] instanceof ReferenceSymbol
      ) {
        const refErrArr = this.validateRefArr(symbol.value, globalTable);
        errTable.add(symbol.def, refErrArr);
      } else if (symbol instanceof AngleSymbol) {
        this.validateAngleSymbol(symbol, errTable, globalTable);
      } else {
        continue;
      }
    }

    for (const nestedScope of this.nestedScopes) {
      nestedScope.validate(errTable, globalTable);
    }
  }

  /**
   * Helper method for validate reference lists
   * @param refArr ReferenceSymbol[]
   * @param globalTable SymbolTable
   * @returns RefError[]
   */
  private validateRefArr(
    refArr: ReferenceSymbol[],
    globalTable: SymbolTable
  ): RefError[] {
    const refErrors = [];
    for (const refListItem of refArr) {
      const refListErr = this.lookup(refListItem, globalTable);

      if (refListErr) {
        refErrors.push(refListErr);
      }
    }
    return refErrors;
  }

  /**
   * Helper method for validating polymer graph connection properties
   * @param symbol AngleSymbol
   * @param globalTable SymbolTable
   */
  private validateAngleSymbol(
    symbol: AngleSymbol,
    errTable: ErrorTable,
    globalTable: SymbolTable
  ): void {
    for (const conn of symbol.connections) {
      const sourcErrs = this.validateRefArr(conn.sources, globalTable);
      const targetErr = this.validateRefArr(conn.targets, globalTable);

      errTable.add(symbol.def, sourcErrs);
      errTable.add(symbol.def, targetErr);
    }
  }

  /**
   * Helper method to recursively traverse symbol table to find referenced symbol
   * if symbol is found, passes the symbol path to the validate path method
   * @param symbol ReferenceSymbol
   * @param globalTable SymbolTable
   * @returns RefError | undefined
   */
  private lookup(
    symbol: ReferenceSymbol,
    globalTable: SymbolTable
  ): RefError | undefined {
    let referenceBase = this._symbols.get(symbol.base);

    if (referenceBase) {
      if (referenceBase && symbol.path.length) {
        return this.validatePath(
          symbol,
          [symbol.base, ...symbol.path],
          globalTable
        );
      } else {
        return;
      }
    }

    if (!this.enclosingScope) {
      return new RefError(`${symbol.base} is not defined`, symbol.token);
    } else {
      return this.enclosingScope.lookup(symbol, globalTable);
    }
  }

  /**
   * Helper method to validate path on nested scopes of a found symbol. Method will check global scope if item is not found locally.
   * This behavior is primarly for polymer graphs, where fragments are declared globally.
   * @TODO clean up logic for path validation, enable autocompletions
   * @param symbol ReferenceSymbol
   * @param path string[]
   * @param globalTable SymbolTable
   * @returns RefError | undefined
   */
  private validatePath(
    symbol: ReferenceSymbol,
    path: string[],
    globalTable: SymbolTable
  ): RefError | undefined {
    //checks current scope for path item
    let pathItem = this._symbols.get(path[0]);
    let nextScope = this.nestedScopes.find((el) => el.scope === path[0]);
    let newPath = path.slice(1);

    if (pathItem && !newPath.length && !nextScope) {
      return;
    }

    if (!pathItem || !nextScope) {
      //if path item does not exist on current scope, it checks global scope
      let globalItem = globalTable._symbols.get(path[0]);
      let globalItemScope = globalTable.nestedScopes.find(
        (el) => el.scope === path[0]
      );

      if (!globalItem || !globalItemScope) {
        logger.silly(`creating path error for ${newPath[0]} on ${symbol.name}`);
        return new RefError(
          `Property ${path[0]} is not defined on ${this.scope}`,
          symbol.token
        );
      }

      if (newPath.length) {
        //re-initiates path search if item found on global scope
        return globalItemScope.validatePath(symbol, newPath, globalTable);
      } else {
        return;
      }
    }

    if (!newPath.length) {
      return;
    }

    return nextScope.validatePath(symbol, newPath, globalTable);
  }

  /**
   * Converts symbol table to a string for logging purposes.
   * @returns string
   */
  public print(): string {
    let header = `Scope: ${this.scope}\nEnclosing: ${
      this.enclosingScope?.scope || null
    }\nNested: ${this.nestedScopes
      .map((el) => el.scope)
      .join(", ")}\n--------------\n`;

    let table = "Table:";
    for (const value of this._symbols.values()) {
      table = table + "\n" + `\t${value.print()}`;
    }

    let footer = "\n-------------------\n";

    let full = `${header}${table}${footer}`;

    for (const childScope of this.nestedScopes) {
      full = full + "\n" + childScope.print();
    }

    return full;
  }
}
