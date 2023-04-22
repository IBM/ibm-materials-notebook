import { DuplicationError, ErrorCode } from "../errors";
import { CmdlCompiler } from "../cmdl-compiler";
import { SymbolTable, SymbolTableBuilder } from "../cmdl-symbols";
import { ErrorTable } from "../../errors";

const compiler = new CmdlCompiler();

async function evalutateText(text: string) {
  const uri = "test/uri";
  const globalTable = new SymbolTable("GLOBAL");
  const errTable = new ErrorTable();
  const builder = new SymbolTableBuilder(globalTable, errTable, uri);

  let { parserErrors, recordTree } = compiler.parse(text);
  const semanticErrors = await recordTree.validate();
  recordTree.createSymbolTable(builder);
  globalTable.validate(errTable);
  const symbolErrors = errTable.get(uri);

  return {
    parserErrors,
    symbolErrors,
    semanticErrors,
    recordTree,
    globalTable,
  };
}

describe("Tests for compilation and symbol table construction", () => {
  it(`recognizes a declaration group and creates a symbol`, async () => {
    const refGroup = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
        inchi: "1S/C4H8O/c1-2-4-5-3-1/h1-4H2";
        inchi_key: "WYURNTSHIVDZCO-UHFFFAOYSA-N";
      }`;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(refGroup);

    console.log(JSON.stringify(semanticErrors, null, 2));
    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`recognizes a duplicate property`, async () => {
    const dualPropGroup = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
        state: "liquid";
      }
    `;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(dualPropGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(1);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`recognizes a duplicate declarations group and creates an error`, async () => {
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
      await evalutateText(dupRefGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(symbolErrors[0]).toBeInstanceOf(DuplicationError);
    expect(symbolErrors[0].code).toBe(ErrorCode.DuplicateItem);
    expect(globalTable.has("THF")).toBeTruthy();
  });

  it(`creates a symbol for a reference group`, async () => {
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
      await evalutateText(referenceSymbol);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
    expect(globalTable.has("ABC")).toBeTruthy();
  });

  it(`recognizes a missing declaration`, async () => {
    const missingDecText = `
    reaction ABC {
        temperature: 100 degC;
        
        @THF {
            mass: 200 g;
            roles: ["solvent"];
        };
    }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(missingDecText);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("ABC")).toBeTruthy();
  });
});

describe("tests for compiler in parsing a reactor graph", () => {
  it("parses a component node with a reference property", async () => {
    const reactorNode = `
      component PolyReactor {
          description: "A polymerization reactor";
      }

      component MonomerTank {
          description: "Tank for monomer solution";
          target: @PolyReactor;
      }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
    expect(globalTable.has("MonomerTank")).toBeTruthy();
  });

  it("recognizes a missing sub property on a reference", async () => {
    const reactorNode = `
      component PolyReactor {
          description: "A polymerization reactor";
      }

      component MonomerTank {
          description: "Tank for monomer solution";
          target: @PolyReactor.Mixer;
      }`;

    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(1);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
    expect(globalTable.has("MonomerTank")).toBeTruthy();
  });

  it("parses a nested reactor node", async () => {
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
      await evalutateText(reactorNode);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("PolyReactor")).toBeTruthy();
  });

  it("parses a full reactor graph", async () => {
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
      await evalutateText(reactorA);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("FlowTest")).toBeTruthy();
  });
});

describe("Tests for parsing cmdl polymer graphs", () => {
  it("parses a simple polymer graph", async () => {
    const graphText = `
      fragment egMeO {
          smiles: "CO[R:1]";
          molecular_weight: 100 g/mol;

          point R {
            quantity: 1;
          };
      }

      fragment pVL {
          smiles: "[Q:1]CCCCC[R:1]";
          molecular_weight: 100 g/mol;

          point R {
            quantity: 1;
          };

          point Q {
            quantity: 1;
          };
      }

      fragment pL-Lac {
          smiles: "[Q:1]CCCOCCC[R:1]";
          molecular_weight: 100 g/mol;

          point R {
            quantity: 1;
          };

          point Q {
            quantity: 1;
          };
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
      await evalutateText(graphText);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("egMeO_pVL")).toBeTruthy();
    expect(globalTable.has("pL-Lac")).toBeTruthy();
    expect(globalTable.has("egMeO")).toBeTruthy();
  });
});

describe("Tests for compiling text with template variables", () => {
  it(`recognizes a variable declaration group and variable properties`, async () => {
    const refGroup = `
      chemical $solvent {
        molecular_weight: $solventMw;
        density: $solventDensity;
        state: "liquid";
      }`;
    const { parserErrors, symbolErrors, semanticErrors, globalTable } =
      await evalutateText(refGroup);

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("solvent")).toBeTruthy();
  });
});
