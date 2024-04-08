import { SymbolTable, CMDLSymbol, SymbolType } from "../symbol-table";

describe("Unit tests for selected SymbolTable functions", () => {
  it("initializes correctly a global table", () => {
    const table = new SymbolTable("GLOBAL", "test/global");
    expect(table.scope).toBe("GLOBAL");
    expect(table.uri).toBe("test/global");
    expect(table.nestedScopes.length).toBe(0);
    expect(table.enclosingScope).toBeNull();
  });

  it("initializes correctly a nested scope", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/global");
    const nestedTable = new SymbolTable("SCOPE_A", "test/uri", globalTable);
    expect(nestedTable.scope).toBe("SCOPE_A");
    expect(nestedTable.uri).toBe("test/uri");
    expect(nestedTable.enclosingScope).toEqual(globalTable);
    expect(nestedTable.nestedScopes.length).toBe(0);
    expect(globalTable.nestedScopes.length).toBe(1);
    expect(globalTable.nestedScopes[0]).toEqual(nestedTable);
  });

  it("adds a nested scope", () => {
    const table = new SymbolTable("TEST", "test/uri");
    const nestedTable = new SymbolTable("SCOPE_A", "test/uri");
    table.addNestedScope(nestedTable);
    expect(table.nestedScopes.length).toBe(1);
    expect(nestedTable.enclosingScope).toEqual(table);
    expect(table.nestedScopes[0]).toEqual(nestedTable);
  });

  it("adds a symbol", () => {
    const recordSymbol: CMDLSymbol = {
      name: "TestRxn",
      symbolType: SymbolType.RECORD,
      valueType: "reaction",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const table = new SymbolTable("TEST", "test/uri");
    table.add(recordSymbol);

    expect(table.has("TestRxn")).toBeTruthy();

    const retrievedSymbol = table.get("TestRxn");
    expect(retrievedSymbol).toEqual(recordSymbol);
  });

  it("adds a symbol with a path", () => {
    const recordSymbol: CMDLSymbol = {
      name: "@TestGraph",
      path: ["structure", "blockA"],
      symbolType: SymbolType.REFERENCE,
      valueType: "chemical",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const table = new SymbolTable("TEST", "test/uri");
    table.add(recordSymbol);

    expect(table.has("@TestGraph")).toBeTruthy();

    const retrievedSymbol = table.get("@TestGraph");
    expect(retrievedSymbol).toEqual(recordSymbol);
  });

  it("determines if symbol exists on current scope", () => {
    const recordSymbol: CMDLSymbol = {
      name: "TestRxn",
      symbolType: SymbolType.RECORD,
      valueType: "reaction",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const table = new SymbolTable("TEST", "test/uri");
    table.add(recordSymbol);

    expect(table.has("TestRxn")).toBeTruthy();
    expect(table.has("MissingSymbol")).toBeFalsy();
  });

  it("throws an error when getting a missing symbol", () => {
    const table = new SymbolTable("TEST", "test/uri");
    expect(() => table.get("MissingSymbol")).toThrow();
  });

  it("correctly performs a lookup on a symbol defined on a nested scope", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/global");
    const nestedTable1 = new SymbolTable(
      "Collection_A",
      "test/uri",
      globalTable
    );
    const nestedTable2 = new SymbolTable(
      "Collection_B",
      "test/uri",
      globalTable
    );
    const nestedTable3 = new SymbolTable(
      "Collection_AA",
      "test/uri",
      nestedTable1
    );

    const recordSymbol: CMDLSymbol = {
      name: "TestRxn",
      symbolType: SymbolType.RECORD,
      valueType: "reaction",
      scope: "Collection_AA",
      uri: "test/uri",
    };

    nestedTable3.add(recordSymbol);
    const localLookup = nestedTable3.lookup(recordSymbol.name);
    expect(localLookup).toEqual(recordSymbol);
    expect(() => globalTable.lookup(recordSymbol.name)).toThrow(
      `${recordSymbol.name} is undefined`
    );
    expect(() => nestedTable1.lookup(recordSymbol.name)).toThrow(
      `${recordSymbol.name} is undefined`
    );
    expect(() => nestedTable2.lookup(recordSymbol.name)).toThrow(
      `${recordSymbol.name} is undefined`
    );
  });

  it("correctly performs a lookup on a symbol defined on an intermediate scope", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/global");
    const nestedTable1 = new SymbolTable(
      "Collection_A",
      "test/uri",
      globalTable
    );
    const nestedTable2 = new SymbolTable(
      "Collection_B",
      "test/uri",
      globalTable
    );
    const nestedTable3 = new SymbolTable(
      "Collection_AA",
      "test/uri",
      nestedTable1
    );

    const recordSymbol: CMDLSymbol = {
      name: "TestRxn",
      symbolType: SymbolType.RECORD,
      valueType: "reaction",
      scope: "Collection_A",
      uri: "test/uri",
    };

    nestedTable1.add(recordSymbol);
    const nestedLookup = nestedTable3.lookup(recordSymbol.name);
    const localLookup = nestedTable1.lookup(recordSymbol.name);
    expect(nestedLookup).toEqual(recordSymbol);
    expect(localLookup).toEqual(recordSymbol);
    expect(() => globalTable.lookup(recordSymbol.name)).toThrow(
      `${recordSymbol.name} is undefined`
    );
    expect(() => nestedTable2.lookup(recordSymbol.name)).toThrow(
      `${recordSymbol.name} is undefined`
    );
  });

  it("correctly performs a lookup on a symbol defined on a global scope", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/global");
    const nestedTable1 = new SymbolTable(
      "Collection_A",
      "test/uri",
      globalTable
    );
    const nestedTable2 = new SymbolTable(
      "Collection_B",
      "test/uri",
      globalTable
    );
    const nestedTable3 = new SymbolTable(
      "Collection_AA",
      "test/uri",
      nestedTable1
    );

    const recordSymbol: CMDLSymbol = {
      name: "TestRxn",
      symbolType: SymbolType.RECORD,
      valueType: "reaction",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    globalTable.add(recordSymbol);
    const lookupA = nestedTable3.lookup(recordSymbol.name);
    const lookupAA = nestedTable1.lookup(recordSymbol.name);
    const lookupB = nestedTable2.lookup(recordSymbol.name);
    const globalLookup = globalTable.lookup(recordSymbol.name);

    expect(lookupA).toEqual(recordSymbol);
    expect(lookupAA).toEqual(recordSymbol);
    expect(lookupB).toEqual(recordSymbol);
    expect(globalLookup).toEqual(recordSymbol);
  });

  it("peforms a lookup with a path", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/global");
    const nestedTable1 = new SymbolTable("A", "test/uri", globalTable);
    const nestedTable2 = new SymbolTable("B", "test/uri", globalTable);
    const nestedTable3 = new SymbolTable("AA", "test/uri", nestedTable1);
    const graphTable = new SymbolTable("TestGraph", "test/uri", nestedTable3);

    const collASymbol: CMDLSymbol = {
      name: "A",
      symbolType: SymbolType.COLLECTION,
      valueType: "collection",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const collBSymbol: CMDLSymbol = {
      name: "B",
      symbolType: SymbolType.COLLECTION,
      valueType: "collection",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const collAASymbol: CMDLSymbol = {
      name: "AA",
      symbolType: SymbolType.COLLECTION,
      valueType: "collection",
      scope: "A",
      uri: "test/uri",
    };

    const graphSymbol: CMDLSymbol = {
      name: "TestGraph",
      symbolType: SymbolType.GRAPH,
      valueType: "reaction",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const graphPropSymbol: CMDLSymbol = {
      name: "structure",
      symbolType: SymbolType.PROPERTY,
      valueType: "reference",
      scope: "GLOBAL",
      uri: "test/uri",
    };

    const graphRef: CMDLSymbol = {
      name: "@A",
      path: ["AA", "TestGraph", "structure"],
      symbolType: SymbolType.REFERENCE,
      valueType: "reference",
      scope: "B",
      uri: "test/uri",
    };

    const brokenRef: CMDLSymbol = {
      name: "@AA",
      path: ["TestGraph", "badProp"],
      symbolType: SymbolType.REFERENCE,
      valueType: "reference",
      scope: "B",
      uri: "test/uri",
    };

    globalTable.add(collASymbol);
    globalTable.add(collBSymbol);
    globalTable.add(brokenRef);
    nestedTable1.add(collAASymbol);
    nestedTable3.add(graphSymbol);
    graphTable.add(graphPropSymbol);
    nestedTable2.add(graphRef);

    const pathLookup = nestedTable2.lookup("A", graphRef.path);
    expect(pathLookup).toEqual(graphPropSymbol);
    expect(() => globalTable.lookup("AA", brokenRef.path)).toThrow();
  });

  it.skip("can remove stale symbols", () => {});
  it.skip("can search symbols based on a query", () => {});
});
