import {
  CMDLBoolProp,
  CMDLListProp,
  CMDLNumProp,
  CMDLRefProp,
  CMDLAssignProp,
  CMDLRefListProp,
  CMDLEdgeProp,
  CMDLStrProp,
} from "../properties";
import { CMDLReference } from "../collections";
import { CMDLToken } from "../../cmdl-cst-visitor";
import { TokenLabel, TokenTypes } from "../../parser";

function makePropNameToken() {
  const token = new CMDLToken({
    image: `test`,
    startOffset: 20,
    endOffset: 24,
    tokenType: { name: TokenTypes.IDENTIFIER },
    tokenTypeIdx: 1,
  });
  token.label = TokenLabel.PROP_NAME;
  return token;
}

function makeColonToken() {
  const token = new CMDLToken({
    image: ":",
    startOffset: 25,
    endOffset: 25,
    tokenType: { name: TokenTypes.COLON },
    tokenTypeIdx: 1,
  });
  return token;
}

function makeValueToken(value: string, type: TokenTypes, label: TokenLabel) {
  const token = new CMDLToken({
    image: `${value}`,
    startOffset: 26,
    endOffset: 26 + value.length - 1,
    tokenType: { name: type },
    tokenTypeIdx: 1,
  });
  token.label = label;
  return token;
}

function makeUnitToken(value: string) {
  const token = new CMDLToken({
    image: `${value}`,
    startOffset: 29,
    endOffset: 29 + value.length - 1,
    tokenType: { name: TokenTypes.IDENTIFIER },
    tokenTypeIdx: 1,
  });
  token.label = TokenLabel.NUM_UNIT;
  return token;
}

function makeUncOpToken() {
  const token = new CMDLToken({
    image: "±",
    startOffset: 29,
    endOffset: 30,
    tokenType: { name: TokenTypes.IDENTIFIER },
    tokenTypeIdx: 1,
  });
  token.label = TokenLabel.NUM_UNIT;
  return token;
}

function makeRefToken(name: string) {
  const token = new CMDLToken({
    image: `@${name}`,
    startOffset: 29,
    endOffset: 30,
    tokenType: { name: TokenTypes.REF },
    tokenTypeIdx: 1,
  });
  token.label = TokenLabel.REF_NAME;
  return token;
}

function createRef(name: string, path: string[]) {
  const refToken = makeRefToken(name);
  const pathTokens = [];
  for (const pathItem of path) {
    const pathToken = makeValueToken(
      pathItem,
      TokenTypes.IDENTIFIER,
      TokenLabel.REF_ITEM
    );
    pathTokens.push(pathToken);
  }
  return new CMDLReference(refToken, ...pathTokens);
}

describe("Unit tests for AST property node classes", () => {
  describe("CMDLRefProp", () => {
    it("initializes correctly", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const ref = createRef("test1", ["path"]);
      const refProp = new CMDLRefProp(propToken, colonToken, ref);

      expect(refProp.name).toBe("test");
      expect(refProp.value).toBeInstanceOf(CMDLReference);
      expect(refProp.value?.name).toBe("@test1");
      expect(refProp.value?.path.length).toBe(1);
      expect(refProp.value?.path[0]).toBe("path");
    });
  });

  describe("CMDLListProp", () => {
    it("initializes correctly", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken1 = makeValueToken(
        "value1",
        TokenTypes.STRING,
        TokenLabel.STR_VALUE
      );
      const valueToken2 = makeValueToken(
        "value2",
        TokenTypes.STRING,
        TokenLabel.STR_VALUE
      );
      const valueToken3 = makeValueToken(
        "value3",
        TokenTypes.STRING,
        TokenLabel.STR_VALUE
      );

      const listProp = new CMDLListProp(
        propToken,
        colonToken,
        valueToken1,
        valueToken2,
        valueToken3
      );

      expect(listProp.name).toBe("test");
      expect(listProp.values.length).toBe(3);
      expect(listProp.values).toEqual(["value1", "value2", "value3"]);
    });
  });

  describe("CMDLNumProp", () => {
    it("initializes correctly from a unitless numerical value", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "15",
        TokenTypes.NUM,
        TokenLabel.NUM_VALUE
      );
      const prop = new CMDLNumProp(propToken, colonToken, valueToken);
      expect(prop.name).toBe("test");
      expect(prop.value).toBeCloseTo(15);
    });
    it("initializes correctly from a unitless numerical value with uncertainty", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "15.2",
        TokenTypes.NUM,
        TokenLabel.NUM_VALUE
      );
      const uncOpToken = makeUncOpToken();
      const uncToken = makeValueToken(
        "1.2",
        TokenTypes.NUM,
        TokenLabel.UNC_VALUE
      );
      const prop = new CMDLNumProp(
        propToken,
        colonToken,
        valueToken,
        uncOpToken,
        uncToken
      );
      expect(prop.name).toBe("test");
      expect(prop.value).toBeCloseTo(15.2);
      expect(prop.uncertainty).toBeCloseTo(1.2);
    });
    it("initializes correctly from a numerical value with units and uncertainty", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "15.2",
        TokenTypes.NUM,
        TokenLabel.NUM_VALUE
      );
      const uncOpToken = makeUncOpToken();
      const uncToken = makeValueToken(
        "1.2",
        TokenTypes.NUM,
        TokenLabel.UNC_VALUE
      );
      const unitToken = makeUnitToken("kg");
      const prop = new CMDLNumProp(
        propToken,
        colonToken,
        valueToken,
        uncOpToken,
        uncToken,
        unitToken
      );
      expect(prop.name).toBe("test");
      expect(prop.value).toBeCloseTo(15.2);
      expect(prop.uncertainty).toBeCloseTo(1.2);
      expect(prop.unit).toBe("kg");
    });
  });

  describe("CMDLBoolProp", () => {
    it("initializes correctly with true", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "true",
        TokenTypes.TRUE,
        TokenLabel.BOOL_VALUE
      );
      const prop = new CMDLBoolProp(propToken, colonToken, valueToken);
      expect(prop.name).toBe("test");
      expect(prop.value).toBe(true);
    });

    it("initializes correctly with false", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "false",
        TokenTypes.FALSE,
        TokenLabel.BOOL_VALUE
      );
      const prop = new CMDLBoolProp(propToken, colonToken, valueToken);
      expect(prop.name).toBe("test");
      expect(prop.value).toBe(false);
    });
  });

  describe("CMDLStrProp", () => {
    it("initializes correctly", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const valueToken = makeValueToken(
        "test value",
        TokenTypes.STRING,
        TokenLabel.STR_VALUE
      );
      const prop = new CMDLStrProp(propToken, colonToken, valueToken);
      expect(prop.name).toBe("test");
      expect(prop.value).toBe("test value");
    });
  });

  describe("CMDLAssignProp", () => {
    it("initializes correctly", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const type = makeValueToken("smiles", TokenTypes.STRING, TokenLabel.TYPE);
      const value = makeValueToken(
        "CCCCC",
        TokenTypes.STRING,
        TokenLabel.STR_VALUE
      );
      const assignProp = new CMDLAssignProp(propToken, colonToken, type, value);
      expect(assignProp.name).toBe("test");
      expect(assignProp.type).toBe("smiles");
      expect(assignProp.value).toBe("CCCCC");
    });
  });

  describe("CMDLEdgeProp", () => {
    it("initializes correctly with defined edge value", () => {
      const rhsRef = createRef("rhs", ["blockA", "R"]);
      const lhsRef = createRef("lhs", ["blockA", "Q"]);
      const colonToken = makeColonToken();
      const edgeVal = makeValueToken(
        "2",
        TokenTypes.NUM,
        TokenLabel.EDGE_VALUE
      );

      const edgeProp = new CMDLEdgeProp(colonToken, edgeVal);
      edgeProp.addRefs([rhsRef], "rhs").addRefs([lhsRef], "lhs");
      expect(edgeProp.value).toBe(2);
      expect(edgeProp.lhs.length).toBe(1);
      expect(edgeProp.rhs.length).toBe(1);
      expect(edgeProp.lhs[0]).toEqual(lhsRef);
      expect(edgeProp.rhs[0]).toEqual(rhsRef);
    });

    it("initializes correctly with undefined edge value", () => {
      const rhsRef = createRef("rhs", ["blockA", "R"]);
      const lhsRef = createRef("lhs", ["blockA", "Q"]);

      const edgeProp = new CMDLEdgeProp(undefined);
      edgeProp.addRefs([rhsRef], "rhs").addRefs([lhsRef], "lhs");
      expect(edgeProp.lhs.length).toBe(1);
      expect(edgeProp.rhs.length).toBe(1);
      expect(edgeProp.lhs[0]).toEqual(lhsRef);
      expect(edgeProp.rhs[0]).toEqual(rhsRef);
    });
  });

  describe("CMDLRefListProp", () => {
    it("initializes correctly", () => {
      const propToken = makePropNameToken();
      const colonToken = makeColonToken();
      const item1 = createRef("item1", ["pathA", "pathB"]);
      const item2 = createRef("item2", ["pathC", "pathD"]);

      const refList = new CMDLRefListProp(propToken, colonToken, item1, item2);
      expect(refList.name).toBe("test");
      expect(refList.children).toEqual([item1, item2]);
    });
  });
});
