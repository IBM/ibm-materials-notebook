import { lexerInstance } from "../parser";

const numericalProp = `temp_boiling: 100.23±1.2 degC;`;
const molarMass = `molecular_weight: 100.2 g/mol;`;
const conversion = `conversion: 20 %;`;
const importStmt = `import polymerA as polymerB from "placeC";`;
const reaction = `reaction ABC {
  temperature: 100 degC;
}`;

const text = `record {
  temp_boiling: 100.23±1.2 degC;
  smiles: "CCC#N[Q:1]";
  @THF {
    pH: 10.3;
  };
}`;

describe("Test lexer on grouped fragments with newlines", () => {
  it("correctly lexes a numerical property", () => {
    const lexingResult = lexerInstance.tokenize(numericalProp);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(7);
  });

  it("correctly lexes a numerical property with a compound unit", () => {
    const lexingResult = lexerInstance.tokenize(molarMass);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(5);
  });

  it("correctly lexes a numerical property with a symbol unit", () => {
    const lexingResult = lexerInstance.tokenize(conversion);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(5);
  });

  it("correctly lexes an unnamed group", () => {
    const lexingResult = lexerInstance.tokenize(text);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(22);
  });

  it("correctly lexes a named group", () => {
    const lexingResult = lexerInstance.tokenize(reaction);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(9);
  });

  it("correctly lexes an import statment", () => {
    const lexingResult = lexerInstance.tokenize(importStmt);
    expect(lexingResult.errors.length).toBe(0);
    expect(lexingResult.tokens.length).toBe(7);
  });
});
