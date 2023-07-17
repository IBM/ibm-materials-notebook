import { logger } from "../logger";
import { SymbolTable, AstVisitor } from "./symbol-table";
import {
  ConnectionSymbol,
  BaseSymbol,
  DeclarationSymbol,
  PropertySymbol,
  ReferenceSymbol,
  SymbolType,
  AngleSymbol,
  GroupSymbol,
  ImportSymbol,
} from "./cmdl-symbol-base";
import { BaseError, DuplicationError, RefError } from "../errors";
import { typeManager } from "cmdl-types";
import {
  AngleProperty,
  NamedGroup,
  RecordNode,
  ReferenceGroup,
  RefListProperty,
  RefProperty,
  SymbolReference,
  VariableGroup,
  ImportOp,
  ReferenceValue,
  Group,
  Property,
  ImportFileOp,
  ProtocolGroup,
} from "../cmdl-tree";
import { CmdlStack } from "../cmdl-stack";
import { CmdlToken } from "../cmdl-ast";
import { ErrorTable } from "../error-manager";
import { TYPES } from "cmdl-types";

/**
 * Visits record tree and constructs symbol table for entire document
 */
export class SymbolTableBuilder implements AstVisitor {
  private tableStack = new CmdlStack<SymbolTable>();
  errors: ErrorTable;
  namespace: string;
  uri: string;

  constructor(
    global: SymbolTable,
    errors: ErrorTable,
    namespace: string,
    uri: string
  ) {
    this.namespace = namespace;
    this.uri = uri;
    this.errors = errors;
    this.tableStack.push(global);
  }

  /**
   * Adds a symbol to the table at the top of the stack
   * Throws an error if symbol already exists
   * Merges connection symbols into a single connection property
   * @param symbol BaseSymbol
   */
  private addSymbol(symbol: BaseSymbol): void {
    const table = this.tableStack.peek();

    if (table.has(symbol.name)) {
      if (symbol instanceof ConnectionSymbol) {
        let conn = table.get(symbol.name);

        if (!this.isAngleProp(conn)) {
          throw new RefError(
            `Unable to find ${symbol.name} to add connections`,
            symbol.token
          );
        }

        conn.addConnection(symbol);
        table.add(symbol.name, conn);
      } else {
        this.checkRefSymbolPaths(symbol, table);
      }
    } else if (!table.has(symbol.name) && symbol instanceof ConnectionSymbol) {
      const angleSym = new AngleSymbol({
        name: "connections",
        token: symbol.token,
        def: this.uri,
        type: SymbolType.ANGLE_PROPERTY,
      });
      angleSym.addConnection(symbol);
      table.add(angleSym.name, angleSym);
    } else {
      table.add(symbol.name, symbol);
    }
  }

  /**
   * Method to compare reference symbols if their paths are identical
   * @TODO This approach is not the best as the new reference symbol is never added => rework using proxy symbols?
   * @param symbol BaseSymbol
   * @param table SymbolTable
   */
  public checkRefSymbolPaths(symbol: BaseSymbol, table: SymbolTable): void {
    if (symbol instanceof ReferenceSymbol) {
      const other = table.get(symbol.name);
      const newPath = symbol.path.join(".");
      const otherPath = (other as ReferenceSymbol).path.join(".");

      if (newPath === otherPath) {
        const msg = `${table.scope} already has symbol ${symbol.name} defined`;
        throw new DuplicationError(msg, symbol.token);
      }
    } else {
      const msg = `${table.scope} already has symbol ${symbol.name} defined`;
      throw new DuplicationError(msg, symbol.token);
    }
  }

  /**
   * Type predicate for AngleSymbols
   * @param arg BaseSymbol | undefined
   * @returns boolean
   */
  private isAngleProp(arg: BaseSymbol | undefined): arg is AngleSymbol {
    return arg !== undefined && arg instanceof AngleSymbol;
  }

  /**
   * Creates a new scope, attaches to current scope, and pushes to table stack
   * @param name string
   */
  private enterNewScope(name: string): void {
    const currentScope = this.tableStack.peek();
    const nestedScope = new SymbolTable(name, currentScope);
    this.tableStack.push(nestedScope);
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
   * @returns BaseError[]
   */
  public getErrors(): BaseError[] | undefined {
    return this.errors.get(this.uri);
  }

  /**
   * Top level function to visit a node in the record tree
   * @param node RecordNode
   */
  public visit(node: RecordNode): void {
    try {
      node.accept(this);
    } catch (error) {
      this.errors.add(this.uri, [error] as BaseError[]);
      logger.warn(
        `Unable to visit node ${node.name}:\n-${(error as Error).message}`
      );
    }
  }

  /**
   * Creates a declaration symbol and scope for visiting a named group
   * @param group Named Group
   */
  public visitNamedGroup(group: NamedGroup): void {
    const declSymbol = new DeclarationSymbol(
      {
        name: group.identifier,
        token: group.nameToken,
        type: SymbolType.DECLARATION,
        def: this.uri,
      },
      typeManager.getModel(group.name)
    );

    this.addSymbol(declSymbol);
    this.enterNewScope(group.identifier);

    if (group.children.length > 0) {
      group.children.forEach((child) => {
        this.visit(child);
      });
    }

    this.exitCurrentScope();
  }

  /**
   * Creates a declaration symbol and scope for visiting a named group
   * @param group Named Group
   */
  public visitVariableGroup(group: VariableGroup): void {
    const variableName = group.identifier.slice(1);
    const declSymbol = new DeclarationSymbol(
      {
        name: variableName,
        token: group.nameToken,
        type: SymbolType.VARIABLE_DEC,
        def: this.uri,
      },
      typeManager.getModel(group.name)
    );

    this.addSymbol(declSymbol);
    this.enterNewScope(variableName);

    if (group.children.length > 0) {
      group.children.forEach((child) => {
        this.visit(child);
      });
    }

    this.exitCurrentScope();
  }

  /**
   * Creates a group symbol and scope for visiting a general group
   * @param group Group
   */
  public visitGroup(group: Group): void {
    const groupSym = new GroupSymbol({
      name: group.name,
      token: group.nameToken,
      type: SymbolType.GROUP,
      def: this.uri,
    });

    this.addSymbol(groupSym);
    this.enterNewScope(group.name);

    if (group.children.length > 0) {
      group.children.forEach((child) => {
        this.visit(child);
      });
    }

    this.exitCurrentScope();
  }

  /**
   * Creates a property symbol and adds to current scope
   * @param property Property
   */
  public visitProperty(property: Property): void {
    const propSymbol = new PropertySymbol(
      {
        name: property.name,
        token: property.nameToken,
        type: SymbolType.PROPERTY,
        def: this.uri,
      },
      property.getValues()
    );
    this.addSymbol(propSymbol);
  }

  /**
   * Creates a property symbol and adds to current scope
   * @param property Property
   */
  public visitVariableProperty(property: Property): void {
    const propSymbol = new PropertySymbol(
      {
        name: property.name,
        token: property.nameToken,
        type: SymbolType.VARIABLE_PROP,
        def: this.uri,
      },
      property.getValues()
    );
    this.addSymbol(propSymbol);
  }

  /**
   * Creates a declaration symbol and adds to current scope
   * @param node ImportOp
   */
  public visitImportOp(node: ImportOp): void {
    const nameToken = node.aliasToken ? node.aliasToken : node.nameToken;
    const nodeName = node.alias ? node.alias : node.name;

    const importSymbol = new ImportSymbol(
      {
        name: nodeName,
        token: nameToken,
        type: SymbolType.IMPORT,
        def: this.uri,
      },
      node.name,
      node.source,
      node.alias
    );

    this.addSymbol(importSymbol);
  }

  public visitImportFileOp(node: ImportFileOp): void {
    const importSymbol = new ImportSymbol(
      {
        name: node.name,
        token: node.nameToken,
        type: SymbolType.IMPORT,
        def: this.uri,
      },
      node.name,
      node.source
    );

    this.addSymbol(importSymbol);
  }

  /**
   * Helper method to create symbols for individual nodes within a reactor or polymer graph
   * @deprecated
   * @param keyObj CMDLNodeTree
   * @param nameToken CMDLToken
   */
  public createGraphSymbols(
    keyObj: TYPES.NodeTree,
    nameToken: CmdlToken
  ): void {
    for (const key of Object.keys(keyObj)) {
      const propSymbol = new ReferenceSymbol(
        {
          name: key,
          token: nameToken,
          type: SymbolType.REF_PROXY,
          def: this.uri,
        },
        key
      );

      this.addSymbol(propSymbol);

      if (Object.keys(keyObj[key]).length) {
        this.enterNewScope(key);
        this.createGraphSymbols(keyObj[key], nameToken);
        this.exitCurrentScope();
      }
    }
  }

  /**
   * Creates a reference symbol and enters a new scope
   * @param refGroup ReferenceGroup
   */
  public visitReference(refGroup: ReferenceGroup): void {
    const refSymbol = this.createReference(refGroup);

    this.addSymbol(refSymbol);
    this.enterNewScope(refGroup.name);

    if (refGroup.children.length > 0) {
      refGroup.children.forEach((child) => {
        this.visit(child);
      });
    }

    this.exitCurrentScope();
  }

  /**
   * Creates a reference symbol and enters a new scope
   * @param refGroup ProtocolGroup
   */
  public visitProtocol(protocolGroup: ProtocolGroup): void {
    const declSymbol = new DeclarationSymbol(
      {
        name: protocolGroup.name,
        token: protocolGroup.nameToken,
        type: SymbolType.DECLARATION,
        def: this.uri,
      },
      typeManager.getModel(protocolGroup.name)
    );

    this.addSymbol(declSymbol);
  }

  /**
   * Creates a property symbol and adds to current scope
   * @param refProp RefProperty
   */
  public visitRefProp(refProp: RefProperty): void {
    const refSymbol = this.createReference(refProp);

    const propSymbol = new PropertySymbol(
      {
        name: refProp.name,
        token: refProp.nameToken,
        type: SymbolType.REF_PROPERTY,
        def: this.uri,
      },
      refSymbol
    );

    this.addSymbol(propSymbol);

    if (refProp.name === "tree") {
      const parentTable = this.tableStack.peek();
      const refSymName = refSymbol.name.slice(1);
      const ref = parentTable.getGlobalScopeSym(refSymName);
      const keyObj: TYPES.NodeTree = {};

      ref?.copySymbolTree(keyObj, refSymName);
      this.createGraphSymbols(keyObj[refSymName], refProp.nameToken);
    }
  }

  /**
   * Creates a property symbol and adds to current scope
   * @param refList RefListProperty
   */
  public visitRefListProp(refList: RefListProperty): void {
    let valueList = refList.getValues();
    let valueSymbolList = this.createRefArray(valueList);

    const propSymbol = new PropertySymbol(
      {
        name: refList.name,
        token: refList.nameToken,
        type: SymbolType.REF_PROPERTY,
        def: this.uri,
      },
      valueSymbolList
    );
    this.addSymbol(propSymbol);
  }

  /**
   * Creates a connection symbol and adds to an existing angle symbol ("connections" property) on current scope.
   * @param angleProp AngleProperty
   */
  public visitAngleProp(angleProp: AngleProperty): void {
    let sourceList = angleProp.getSources();
    let targetList = angleProp.getTargets();

    let sourceSymList = this.createRefArray(sourceList);
    let targetSymList = this.createRefArray(targetList);

    const propSymbol = new ConnectionSymbol(
      {
        name: angleProp.name,
        token: angleProp.nameToken,
        type: SymbolType.CONNECTION,
        def: this.uri,
      },
      sourceSymList,
      targetSymList,
      angleProp.getValues()
    );
    this.addSymbol(propSymbol);
  }

  /**
   * Helper method for creating a reference symbol array from a reference value array.
   * Used during ConnectionSymbol and RefListSymbol generation.
   * @param refValueArr ReferenceValue[]
   * @returns ReferenceSymbol[]
   */
  private createRefArray(refValueArr: ReferenceValue[]): ReferenceSymbol[] {
    let valueSymbolList = [];

    for (const value of refValueArr) {
      let valueSymbol = this.createReference(value);
      valueSymbolList.push(valueSymbol);
    }
    return valueSymbolList;
  }

  /**
   * Helper method for creating reference Symbols
   * @param refComponent SymbolReference
   * @returns ReferenceSymbol
   */
  private createReference(refComponent: SymbolReference): ReferenceSymbol {
    let symbolName: string;
    let path = refComponent.getPath();

    if (refComponent instanceof ReferenceGroup) {
      symbolName = refComponent.name;
    } else if (
      refComponent instanceof RefProperty ||
      refComponent instanceof ReferenceValue
    ) {
      symbolName = refComponent.getValues();
    } else {
      throw new Error(`Unrecognized symbol property ${refComponent.name}`);
    }

    return new ReferenceSymbol(
      {
        name: symbolName,
        token: refComponent.nameToken,
        type: SymbolType.REFERENCE,
        def: this.uri,
      },
      symbolName.slice(1),
      path
    );
  }
}
