import {
  CMDLCollection,
  CMDLGraph,
  CMDLImport,
  CMDLRoot,
  CMDLRecord,
} from "../collections";
import { createRef, makeValueToken } from "./ast-properties.test";
import { TokenLabel, TokenTypes } from "../../parser";

describe("Unit tests for collection type nodes", () => {
  describe("CMDLRoot", () => {
    it("can add child nodes", () => {
      const root = new CMDLRoot();
      const ref = createRef("testRef", []);
      root.addChildNode(ref);

      expect(root.children.length).toBe(1);
      expect(root.children[0]).toEqual(ref);
    });
  });

  describe("CMDLImport", () => {
    it("initializes correctly", () => {
      const recordToken = makeValueToken("import", TokenTypes.IMPORT);
      const recordName = makeValueToken(
        "testGraph",
        TokenTypes.IDENTIFIER,
        TokenLabel.IMPORT_NAME
      );
      const from = makeValueToken("from", TokenTypes.FROM);
      const source = makeValueToken(
        "../testsource.file",
        TokenTypes.IDENTIFIER,
        TokenLabel.IMPORT_SOURCE
      );

      const record = new CMDLImport(recordToken, recordName, from, source);
      expect(record.name).toBe("testGraph");
      expect(record.source).toBe("../testsource.file");
    });
    it("initializes correctly with alias", () => {
      const recordToken = makeValueToken("import", TokenTypes.IMPORT);
      const recordName = makeValueToken(
        "testGraph",
        TokenTypes.IDENTIFIER,
        TokenLabel.IMPORT_NAME
      );
      const as = makeValueToken("as", TokenTypes.AS);
      const alias = makeValueToken(
        "graph1",
        TokenTypes.IDENTIFIER,
        TokenLabel.IMPORT_ALIAS
      );
      const from = makeValueToken("from", TokenTypes.FROM);
      const source = makeValueToken(
        "../testsource.file",
        TokenTypes.IDENTIFIER,
        TokenLabel.IMPORT_SOURCE
      );

      const record = new CMDLImport(
        recordToken,
        recordName,
        as,
        alias,
        from,
        source
      );
      expect(record.name).toBe("testGraph");
      expect(record.alias).toBe("graph1");
      expect(record.source).toBe("../testsource.file");
    });
  });

  describe("CMDLGraph", () => {
    it("initializes correctly", () => {
      const recordToken = makeValueToken("graph", TokenTypes.GRAPH);
      const recordName = makeValueToken(
        "testGraph",
        TokenTypes.IDENTIFIER,
        TokenLabel.GRAPH_NAME
      );
      const colon = makeValueToken(":", TokenTypes.COLON);
      const type = makeValueToken(
        "Polymer",
        TokenTypes.IDENTIFIER,
        TokenLabel.TYPE
      );

      const record = new CMDLGraph(recordToken, recordName, colon, type);
      expect(record.name).toBe("testGraph");
      expect(record.type).toBe("Polymer");
    });
  });

  describe("CMDLCollection", () => {
    it("initializes correctly", () => {
      const recordToken = makeValueToken("collection", TokenTypes.COLLECTION);
      const recordName = makeValueToken(
        "testCollection",
        TokenTypes.IDENTIFIER,
        TokenLabel.COL_NAME
      );
      const colon = makeValueToken(":", TokenTypes.COLON);
      const end = makeValueToken("end", TokenTypes.END);
      const endName = makeValueToken(
        "testCollection",
        TokenTypes.IDENTIFIER,
        TokenLabel.END_COL_NAME
      );

      const record = new CMDLCollection(
        recordToken,
        recordName,
        colon,
        end,
        endName
      );
      expect(record.name).toBe("testCollection");
    });
  });

  describe("CMDLRecord", () => {
    it("initializes correctly", () => {
      const recordToken = makeValueToken("record", TokenTypes.RECORD);
      const recordName = makeValueToken(
        "testRecord",
        TokenTypes.IDENTIFIER,
        TokenLabel.RECORD_NAME
      );
      const colon = makeValueToken(":", TokenTypes.COLON);
      const type = makeValueToken(
        "Reaction",
        TokenTypes.IDENTIFIER,
        TokenLabel.TYPE
      );

      const record = new CMDLRecord(recordToken, recordName, colon, type);
      expect(record.name).toBe("testRecord");
      expect(record.type).toBe("Reaction");
    });
  });

  describe("CMDLReference", () => {
    it("initializes correctly with no path", () => {
      const ref = createRef("testRef", []);
      expect(ref.name).toBe("@testRef");
      expect(ref.path.length).toBe(0);
    });

    it("initializes correctly with path values", () => {
      const ref = createRef("testRef", ["pathItem"]);
      expect(ref.name).toBe("@testRef");
      expect(ref.path.length).toBe(1);
      expect(ref.path[0]).toBe("pathItem");
    });
  });
});
