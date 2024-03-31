import { logger } from "../logger";
import {
  SymbolTable,
  AstVisitor,
  SymbolType,
  CMDLSymbol,
} from "./symbol-table";
import { CMDLError } from "../errors/errors";
import {
  CMDLNode,
  CMDLRecord,
  CMDLGraph,
  CMDLProperties,
  CMDLImport,
  CMDLReference,
  CMDLAssignProp,
  CMDLEdgeProp,
} from "../ast";
import { CmdlStack } from "../cmdl-stack";
import { ErrorTable } from "../errors/error-manager";

/**
 * Visits record tree and constructs symbol table for entire document
 * @rename to semantic analyzer
 * @todo enable builder reset
 */
export class SymbolTableBuilder implements AstVisitor {
  private tableStack = new CmdlStack<SymbolTable>();
  errors: ErrorTable;
  fileName: string; //?deprecated
  uri: string; //?deprecated

  constructor(
    global: SymbolTable,
    errors: ErrorTable,
    fileName: string,
    uri: string
  ) {
    this.fileName = fileName;
    this.uri = uri;
    this.errors = errors;
    this.tableStack.push(global);
  }

  /**
   * Adds a symbol to the table at the top of the stack
   * Throws an error if symbol already exists
   * Merges connection symbols into a single connection property
   * @todo refactor and remove validation logic
   * @param symbol CMDLSymbol
   */
  private addSymbol(symbol: CMDLSymbol): void {
    const table = this.tableStack.peek();

    if (table.has(symbol.name)) {
      //raise error
    } else {
      table.add(symbol);
    }
  }

  /**
   * Creates a new scope, attaches to current scope, and pushes to table stack
   * @param name string
   */
  private enterNewScope(name: string): void {
    const currentScope = this.tableStack.peek();
    const nestedScope = new SymbolTable(name, this.uri, currentScope);
    this.tableStack.push(nestedScope);
  }

  private getCurrentScope(): string {
    const currentTable = this.tableStack.peek();
    return currentTable.scope;
  }

  /**
   * Pops current scope off of the stack unless it is the global scope
   */
  private exitCurrentScope(): void {
    if (this.tableStack.size > 1) {
      this.tableStack.pop();
    } else {
      logger.warn("Cannot exit global scope");
    }
  }

  /**
   * Gets any generated errors during symbol table construction
   * @deprecated errors will be pushed automatically to error table
   * @returns BaseError[]
   */
  public getErrors(): CMDLError[] | undefined {
    return this.errors.get(this.uri);
  }

  /**
   * Top level function to visit a node in the record tree
   * @param node RecordNode
   */
  public visit(node: CMDLNode): void {
    try {
      node.accept(this);
    } catch (error) {
      this.errors.add(this.uri, [error] as CMDLError[]);
      logger.warn(`Unable to visit node:\n-${(error as Error).message}`);
    }
  }

  /**
   * Adds new record to current scope and its dependents
   * @param record CMDLRecord
   */
  public visitRecord(record: CMDLRecord): void {
    if (!record.name || !record.type) {
      throw new Error("Malformed record definition");
    }

    const recordSymbol: CMDLSymbol = {
      name: record.name,
      scope: this.getCurrentScope(),
      symbolType: SymbolType.RECORD,
      valueType: record.type,
      uri: this.uri,
    };

    this.addSymbol(recordSymbol);
    this.enterNewScope(record.name);

    record.children.forEach((child) => {
      this.visit(child);
    });

    this.exitCurrentScope();
  }

  /**
   * Adds new graph to current scope and its dependents
   * @param record CMDLRecord
   */
  public visitGraph(graph: CMDLGraph): void {
    if (!graph.name || !graph.type) {
      throw new Error("Malformed graph definition");
    }

    const graphSymbol: CMDLSymbol = {
      name: graph.name,
      scope: this.getCurrentScope(),
      symbolType: SymbolType.GRAPH,
      valueType: graph.type,
      uri: this.uri,
    };

    this.addSymbol(graphSymbol);
    this.enterNewScope(graph.name);

    graph.children.forEach((child) => {
      this.visit(child);
    });

    this.exitCurrentScope();
  }

  /**
   * Creates a property symbol and adds to current scope
   * @param property Property
   */
  public visitProperty(property: CMDLProperties): void {
    if (!property.name) {
      throw new Error("Malformed property definition");
    }

    const propSymbol: CMDLSymbol = {
      name: property.name,
      symbolType: SymbolType.PROPERTY,
      valueType: property.name,
      scope: this.getCurrentScope(),
      uri: this.uri,
    };
    this.addSymbol(propSymbol);
  }

  /**
   * Creates a declaration symbol and adds to current scope
   * @todo refactor for new syntax
   * @param node CMDLImport
   */
  public visitImport(node: CMDLImport): void {
    if (!node.name || !node.source) {
      throw new Error("Malformed import statment");
    }

    const importSymbol: CMDLSymbol = {
      name: node.name,
      alias: node.alias,
      symbolType: SymbolType.IMPORT,
      scope: this.getCurrentScope(),
      valueType: node.name,
      uri: this.uri,
    };

    this.addSymbol(importSymbol);
  }

  /**
   * Creates a reference symbol and enters a new scope
   * @param refGroup ReferenceGroup
   */
  public visitReference(ref: CMDLReference): void {
    if (!ref.name) {
      throw new Error("Malformed reference definition");
    }
    const refSymbol: CMDLSymbol = {
      name: ref.name,
      path: ref.path,
      symbolType: SymbolType.REFERENCE,
      valueType: ref.name,
      scope: this.getCurrentScope(),
      uri: this.uri,
    };

    this.addSymbol(refSymbol);
    this.enterNewScope(ref.name);

    ref.children.forEach((child) => {
      this.visit(child);
    });

    this.exitCurrentScope();
  }

  public visitAssignmentProp(prop: CMDLAssignProp) {
    if (!prop.name || !prop.type) {
      throw new Error("Malformed assignment property");
    }

    const assignmentSymbol: CMDLSymbol = {
      name: prop.name,
      valueType: prop.type,
      symbolType: SymbolType.ASSIGN,
      scope: this.getCurrentScope(),
      uri: this.uri,
    };

    this.addSymbol(assignmentSymbol);
  }

  /**
   * Creates a connection symbol and adds to an existing angle symbol ("connections" property) on current scope.
   * @todo generate names for edges
   * @param angleProp AngleProperty
   */
  public visitEdgeProp(angleProp: CMDLEdgeProp): void {
    const propSymbol: CMDLSymbol = {
      name: "connection",
      valueType: "edge",
      symbolType: SymbolType.EDGE,
      scope: this.getCurrentScope(),
      uri: this.uri,
    };

    this.addSymbol(propSymbol);
  }
}
