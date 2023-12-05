import { parserInstance, lexerInstance } from "../parser";

describe("Test parser on simple fragment", () => {
  const importStatement = `import polymerA as polymerB from "placeC";`;
  it("parses an import statement", () => {
    const lexingResult = lexerInstance.tokenize(importStatement);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses an import file statement", () => {
    const importFileStatment = `import * as nmrFile1 from "./nmrFile1.fid";`;
    const lexingResult = lexerInstance.tokenize(importFileStatment);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it(`parses a group declaration`, () => {
    const groupStatement = `
    reaction ABC {
      reaction_temp: 100±2 degC;
    }`;
    const lexingResult = lexerInstance.tokenize(groupStatement);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();

    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a group with a list", () => {
    const groupWithList = `
    chemical {
      roles: [ "monomer", "catalyst" ];
    }`;
    const lexingResult = lexerInstance.tokenize(groupWithList);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a group with a nested reference declaration", () => {
    const refDecGroup = `
    @polymerA.nodeA.fragmentA {
      degree_poly: 38;
    }`;
    const lexingResult = lexerInstance.tokenize(refDecGroup);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a group with property reference", () => {
    const groupWithPropRef = `
    char_data Test-123 {
      file: @fileRef;
    }`;
    const lexingResult = lexerInstance.tokenize(groupWithPropRef);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a simple reaction statement", () => {
    const reactionText = `
    reaction ABC {
      @TMC {
        mass: 20 g;
      };

      @THF {
        test: 20 g;
      };
    }`;

    const lexingResult = lexerInstance.tokenize(reactionText);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a node with a prop ref", () => {
    const refValue = `
    reactor_node ABC {
      component: @DEF;
    }`;
    const lexingResult = lexerInstance.tokenize(refValue);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a node with a prop ref list", () => {
    const targetsValue = `
    reactor_node ABC {
      targets: [@DEF, @GHI.abc];
    }`;
    const lexingResult = lexerInstance.tokenize(targetsValue);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a group with an arrow prop", () => {
    const repeatGroup = `
    connections {
      <@nodeA.R => @nodeB.Q>;
      <@nodeA.R => @nodeC.R>: 2;
    }`;

    const lexingResult = lexerInstance.tokenize(repeatGroup);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a group with an arrow prop and a pipe separator", () => {
    const repeatGroupWithPipe = `
      connections {
        <@nodeA.R | @nodeB.R => @nodeB.Q | @nodeA.Q>;
      }`;

    const lexingResult = lexerInstance.tokenize(repeatGroupWithPipe);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a group with an arrow prop and a pipe separator with a quantity", () => {
    const repeatGroupWithPipeAndQuant = `
      connections {
        <@nodeA.R | @nodeB.R => @nodeB.Q | @nodeA.Q>: 3;
      }`;
    const lexingResult = lexerInstance.tokenize(repeatGroupWithPipeAndQuant);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("parses a mix of edge notations and properties", () => {
    const connectionGroup = `
      container ABC {
        nodes: [@A];
        <@A.R => @A.Q>;
        <@A.R => @DEF.C.R | @DEF.D.Q>: 2;
      }`;

    const lexingResult = lexerInstance.tokenize(connectionGroup);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it parses a statement with template variables", () => {
    const templateVarText = `
    chemical $product {}

    chemical $catalyst {}

    reaction ABC {
      temperature: $rxnTemperature;

      @catalyst {
        mass: $catalystMass;
        roles: ["catalyst"];
      };

      @product {
        roles: ["product"];
      };
    }`;
    const lexingResult = lexerInstance.tokenize(templateVarText);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });

  it("it can parse assignments for SMILES fragments", () => {
    const fragments = `fragments {
      fragment1 =: "CCCO[R:1]";
      fragment2 =: "[Q:1]NCCCN[Q:1]";
    }`;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });
  it("it can parse assignments for SMILES fragments in a named group", () => {
    const fragments = `polymer_graph ABC {
      fragment1 =: "CCCO[R:1]";
      fragment2 =: "[Q:1]NCCCN[Q:1]";
    }`;
    const lexingResult = lexerInstance.tokenize(fragments);
    parserInstance.input = lexingResult.tokens;
    parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
  });
});
