import { NodeTokenManager } from "../collections";
import { CMDLToken } from "../../parser/cst-visitor";
import { TokenTypes } from "../../parser";
import { IToken } from "chevrotain";

const recordToken: IToken = {
  startOffset: 0,
  endOffset: 5,
  startColumn: 1,
  endColumn: 6,
  startLine: 1,
  endLine: 1,
  image: "record",
  tokenType: {
    name: TokenTypes.RECORD,
  },
  tokenTypeIdx: 1,
};

const identToken: IToken = {
  startOffset: 7,
  endOffset: 10,
  startColumn: 8,
  endColumn: 11,
  startLine: 1,
  endLine: 1,
  image: "test",
  tokenType: {
    name: TokenTypes.IDENTIFIER,
  },
  tokenTypeIdx: 1,
};

const colonToken: IToken = {
  startOffset: 11,
  endOffset: 11,
  startColumn: 12,
  endColumn: 12,
  startLine: 1,
  endLine: 1,
  image: ":",
  tokenType: {
    name: TokenTypes.COLON,
  },
  tokenTypeIdx: 1,
};

const typeToken: IToken = {
  startOffset: 13,
  endOffset: 20,
  startColumn: 14,
  endColumn: 21,
  startLine: 1,
  endLine: 1,
  image: "Reaction",
  tokenType: {
    name: TokenTypes.IDENTIFIER,
  },
  tokenTypeIdx: 1,
};

const lcurlToken: IToken = {
  startOffset: 21,
  endOffset: 21,
  startColumn: 22,
  endColumn: 22,
  startLine: 1,
  endLine: 1,
  image: "{",
  tokenType: {
    name: TokenTypes.LCURL,
  },
  tokenTypeIdx: 1,
};

const rcurlToken: IToken = {
  startOffset: 75,
  endOffset: 75,
  startColumn: 76,
  endColumn: 276,
  startLine: 1,
  endLine: 1,
  image: "}",
  tokenType: {
    name: TokenTypes.RCURL,
  },
  tokenTypeIdx: 1,
};

const record = new CMDLToken(recordToken);
const ident = new CMDLToken(identToken);
const colon = new CMDLToken(colonToken);
const recordType = new CMDLToken(typeToken);
const lcurl = new CMDLToken(lcurlToken);
const rcurl = new CMDLToken(rcurlToken);
const tokens = [record, ident, colon, recordType, lcurl, rcurl];

describe("Unit tests for NodeTokenManager", () => {
  it("adds a token", () => {
    const manager = new NodeTokenManager();
    manager.add(record);
    expect(manager.start === 0);
    expect(manager.stop === 5);
    expect(manager.statement_start === 0);
    expect(manager.statement_stop).toBeUndefined();
    expect(manager.tokens[0]).toEqual(record);
  });
  it("correctly increments start and stop values for a series of tokens", () => {
    const manager = new NodeTokenManager();
    for (const item of tokens) {
      manager.add(item);
    }
    expect(manager.start === 0);
    expect(manager.stop === 75);
    expect(manager.statement_start === 0);
    expect(manager.statement_stop === 21);
    expect(manager.body_start === 21);
    expect(manager.body_stop === 75);
  });
  it("returns true or an offset within the token range", () => {
    const manager = new NodeTokenManager();
    for (const item of tokens) {
      manager.add(item);
    }
    expect(manager.checkRange(44)).toBe(true);
  });
  it("returns false or an offset outside the token range", () => {
    const manager = new NodeTokenManager();
    for (const item of tokens) {
      manager.add(item);
    }
    expect(manager.checkRange(144)).toBe(false);
  });
});
