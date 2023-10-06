import { DuplicationError, ErrorCode } from "../errors";
import { Compiler } from "../compiler";
import { SymbolTable, SymbolTableBuilder } from "../symbols";
import { ErrorTable } from "../error-manager";
import { SymbolTableManager } from "../symbol-manager";

const compiler = new Compiler();
const symbolManager = new SymbolTableManager();

function evalutateText(text: string) {
  const namespace = "test";
  const uri = "test/uri";
  const errors = new ErrorTable();
  const globalTable = new SymbolTable("GLOBAL", symbolManager);
  const builder = new SymbolTableBuilder(globalTable, errors, namespace, uri);

  let { parserErrors, recordTree } = compiler.parse(text);
  const semanticErrors = recordTree.validate();
  recordTree.createSymbolTable(builder);
  globalTable.validate(errors);
  const symbolErrors = builder.getErrors() || [];

  return {
    parserErrors,
    symbolErrors,
    semanticErrors,
    recordTree,
    globalTable,
  };
}

describe("Tests for compilation and symbol table construction", () => {
  it(`recognizes a declaration group and creates a symbol`, () => {
    const refGroup = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
        inchi: "1S/C4H8O/c1-2-4-5-3-1/h1-4H2";
        inchi_key: "WYURNTSHIVDZCO-UHFFFAOYSA-N";
      }`;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(refGroup);

    console.log(JSON.stringify(semanticErrors, null, 2));
    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`recognizes a char_data group and creates a symbol`, () => {
    const refGroup = `
      char_data test-char-group {
        technique: "nmr";
        sample_id: "123-test";
        time_point: 5 s;
      }`;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(refGroup);

    console.log(JSON.stringify(parserErrors, null, 2));
    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("test-char-group")).toBeTruthy();
  });

  it.skip(`recognizes a duplicate property`, () => {
    const dualPropGroup = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
        state: "liquid";
      }
    `;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(dualPropGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(1);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`recognizes a duplicate declarations group and creates an error`, () => {
    const dupRefGroup = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }

      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }
    `;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(dupRefGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(symbolErrors[0]).toBeInstanceOf(DuplicationError);
    expect(symbolErrors[0].code).toBe(ErrorCode.DuplicateItem);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`creates a symbol for a reference group`, () => {
    const referenceSymbol = `

    chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }

    reaction ABC {
        temperature: 100 degC;
        
        @THF {
            mass: 200 g;
            roles: ["solvent"];
        };
    }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(referenceSymbol);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
    expect(globalTable.has("ABC")).toBeTruthy();
  });

  it(`recognizes a missing declaration`, () => {
    const missingDecText = `
    reaction ABC {
        temperature: 100 degC;
        
        @THF {
            mass: 200 g;
            roles: ["solvent"];
        };
    }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(missingDecText);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("ABC")).toBeTruthy();
  });
});

describe("tests for compiler in parsing a reactor graph", () => {
  it("parses a component node with a reference property", () => {
    const reactorNode = `
      component PolyReactor {
          description: "A polymerization reactor";
      }

      component MonomerTank {
          description: "Tank for monomer solution";
          target: @PolyReactor;
      }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
    expect(globalTable.has("MonomerTank")).toBeTruthy();
  });

  it.skip("recognizes a missing sub property on a reference", () => {
    const reactorNode = `
      component PolyReactor {
          description: "A polymerization reactor";
      }

      component MonomerTank {
          description: "Tank for monomer solution";
          target: @PolyReactor.Mixer;
      }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
    expect(globalTable.has("MonomerTank")).toBeTruthy();
  });

  it("parses a nested reactor node", () => {
    const reactorNode = `
      reactor PolyReactor {
            component ReactorTube {
                volume: 2 ml;
                inner_diameter: 0.1 mm;
            };

            component Mixer {
                description: "PEEK T-mixer";
                target: @ReactorTube;
            };
        }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
  });

  it.skip("parses a full reactor graph", () => {
    const reactorA = `
      reactor_graph FlowTest {

        component Collection {
            description: "reactor output";
        };

        reactor PolyReactor {
            component ReactorTube {
                target: @FlowTest.Collection;
                volume: 2 ml;
                inner_diameter: 0.1 mm;
            };

            component Mixer {
                description: "PEEK T-mixer";
                target: @ReactorTube;
            };
        };

        component MonomerTank {
            description: "Tank for monomer solution";
            target: @PolyReactor.Mixer;
        };

        component CatalystTank {
            description: "Tank for catalyst solution";
            target: @PolyReactor.Mixer;
        };
    }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(reactorA);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("FlowTest")).toBeTruthy();
  });
});

describe("Tests for parsing cmdl polymer graphs", () => {
  it("parses a simple polymer graph", () => {
    const graphText = `
      fragments {
          egMeO =: "CO[R:1]";
          pVL =: "[Q:1]CCCCC[R:1]";
          pL-Lac =: "[Q:1]CCCOCCC[R:1]";
      }

      polymer_graph egMeO_pVL {
          nodes: [@egMeO];
          <@egMeO.R => @BlockA.pVL.Q>;
          <@BlockA.pVL.R => @BlockB.pL-Lac.Q>;

          container BlockA {
              nodes: [@pVL];
              <@pVL.Q => @pVL.R>;
          };

          container BlockB {
              nodes: [@pL-Lac];
              <@pL-Lac.Q => @pL-Lac.R>;
          };
      }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(graphText);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    // expect(globalTable.has("egMeO_pVL")).toBeTruthy();
    // expect(globalTable.has("pL-Lac")).toBeTruthy();
    // expect(globalTable.has("egMeO")).toBeTruthy();
  });
});

describe("Tests for compiling text with template variables", () => {
  it(`recognizes a variable declaration group and variable properties`, () => {
    const refGroup = `
      chemical $solvent {
        molecular_weight: $solventMw;
        density: $solventDensity;
        state: "liquid";
      }`;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      evalutateText(refGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("solvent")).toBeTruthy();
  });
});
