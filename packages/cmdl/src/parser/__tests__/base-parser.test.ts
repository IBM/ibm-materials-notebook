import { lexerInstance } from "../tokens";
import { parserInstance } from "../parser";

describe("Parser tests on import statements", () => {
  it("parses an import statement", () => {
    const importStatement = `import polymerA as polymerB from "placeC";`;
    const lexingResult = lexerInstance.tokenize(importStatement);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });
});

describe("Parser tests on record declarations", () => {
  it(`parses a record declaration`, () => {
    const groupStatement = `
    record ABC : Reaction {
      reaction_temp: 100±2 degC;
    }`;
    const lexingResult = lexerInstance.tokenize(groupStatement);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a record with a reference property", () => {
    const groupWithPropRef = `
    record Test-123 : NMR {
      file: @fileRef;
    }`;
    const lexingResult = lexerInstance.tokenize(groupWithPropRef);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a record with a reference list property", () => {
    const groupWithPropRef = `
    record Test-123 : FlowReaction {
      inputs: [ @solutionA, @solutionB, @solutionC ];
    }`;
    const lexingResult = lexerInstance.tokenize(groupWithPropRef);
    parserInstance.input = lexingResult.tokens;
    const result = parserInstance.parse();
    console.log(JSON.stringify(result, null, 2));
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a record with nested reference groups", () => {
    const reactionText = `
    record ABC : Reaction {
      @TMC {
        mass: 20 g;
      };

      @THF {
        test: 20 g;
      };
    }`;

    const lexingResult = lexerInstance.tokenize(reactionText);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });
});

describe("Parser tests on graph and reference declarations", () => {
  it("parses a graph declaration", () => {
    const groupWithList = `
    graph PLLA : Polymer {
       nodes: [ @A, @B ];
       <@A.R => @A.Q>;
       <@A.R => @DEF.C.R | @DEF.D.Q>: 2;
    }`;
    const lexingResult = lexerInstance.tokenize(groupWithList);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a reference declaration with member properties", () => {
    const refDecGroup = `
    record ABC : NMR {
      @PolymerA.BlockA.NodeB {
        degree_poly: 20;
      };
    }`;
    const lexingResult = lexerInstance.tokenize(refDecGroup);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });
  it("errors if reference decleration occurs outside a record", () => {
    const refDecGroup = `
     @PolymerA.BlockA.NodeB {
        degree_poly: 20;
      }`;
    const lexingResult = lexerInstance.tokenize(refDecGroup);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(1);
  });
});

describe("Parser test on assignment statements", () => {
  it("sucessfully parses an assignment statement", () => {
    const fragments = `
      prop fragment1 : SMILES := "CCCO[R:1]";
      prop fragment2 : SMILES := "[Q:1]NCCCN[Q:1]";
    `;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("errors when parseing an assignment statement with missing type", () => {
    const fragments = `
      prop fragment1 : SMILES := "CCCO[R:1]";
      prop fragment2 := "[Q:1]NCCCN[Q:1]";
    `;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(1);
  });
});

describe("Parser tests on collection declarations", () => {
  it("parses collection declarations", () => {
    const fragments = `
      collection A
      end A
      collection B
      end B
    `;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });
  it("parses collection declarations with nested records", () => {
    const fragments = `
      collection A
        record ABC : Reaction {
          time: 100 s;
        }
      end A
      collection B
        record DEF : Reaction {
          temperature: 300 degC;
        }
      end B
    `;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    expect(parserInstance.errors.length).toBe(0);
  });
  it("parses nested collection declarations with nested records", () => {
    const fragments = `
      collection A
        record ABC : Reaction {
          time: 100 s;
        }
        collection B
          record DEF : Reaction {
            temperature: 300 degC;
          }
        end B
      end A
    `;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parse();
    // console.log(JSON.stringify(output, null, 2));
    expect(parserInstance.errors.length).toBe(0);
  });
});
