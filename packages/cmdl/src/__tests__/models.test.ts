import { ModelVisitor, ModelARManager } from "../intepreter";
import { Compiler } from "../compiler";
import { SymbolTable, SymbolTableBuilder } from "../symbols";
import { CmdlTree } from "../cmdl-tree";
import { TYPES } from "cmdl-types";
import { ErrorTable } from "../error-manager";
import { Controller } from "../controller";
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

function evaluateModel(recordTree: CmdlTree) {
  const controller = new Controller("/");
  const uri = "test/uri";
  const cellUri = "test/uri/cell";
  const manager = new ModelARManager(uri);
  const globalAR = manager.createGlobalAR(cellUri);
  const modelVisitor = new ModelVisitor(globalAR, uri, controller);
  recordTree.evaluate(modelVisitor);

  return manager.getRecord(cellUri);
}

describe("Test model evaluation with compiler", () => {
  it("evaluates a chemical model", () => {
    const chemical = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }`;

    const {
      parserErrors,
      symbolErrors,
      recordTree,
      semanticErrors,
      globalTable,
    } = evalutateText(chemical);

    const testAR = evaluateModel(recordTree);
    const THF = testAR.getValue("THF");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
    expect(THF).toBeTruthy();
    expect(THF).toHaveProperty("properties.molecular_weight");
  });

  it("evaluates a reaction model", () => {
    const reaction = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }

      chemical KOME {
        molecular_weight: 70.132 g/mol;
        state: "solid";
      }

      chemical lLac {
        molecular_weight: 144.12 g/mol;
        state: "solid";
      }


      reaction TestReaction {
        temperature: 22 degC;

        @KOME {
          mass: 0.70 mg;
          roles: ["catalyst"];
        };

        @lLac {
          mass: 144 mg;
          roles: ["monomer"];
        };

        @THF {
          volume: 1 ml;
          roles: ["solvent"];
        };
      }`;

    const {
      parserErrors,
      symbolErrors,
      recordTree,
      semanticErrors,
      globalTable,
    } = evalutateText(reaction);

    const testAR = evaluateModel(recordTree);
    const testRxn = testAR.getOptionalValue<TYPES.Reaction>("TestReaction");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
    expect(testRxn).toBeTruthy();
    expect(testAR.getOptionalValue("THF")).toBeTruthy();
    expect(testAR.getOptionalValue("KOME")).toBeTruthy();
    expect(testAR.getOptionalValue("lLac")).toBeTruthy();
    // expect(testRxn?.reactants.length).toBe(3);
  });

  it("evaluates a solution model", () => {
    const solution = `chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }

      chemical KOME {
        molecular_weight: 70.132 g/mol;
        state: "solid";
      }

      chemical lLac {
        molecular_weight: 144.12 g/mol;
        state: "solid";
      }


      solution TestSolution {
        @KOME {
          mass: 0.70 mg;
          roles: ["catalyst"];
        };

        @lLac {
          mass: 144 mg;
          roles: ["monomer"];
        };

        @THF {
          volume: 1 ml;
          roles: ["solvent"];
        };
      }`;

    const {
      parserErrors,
      symbolErrors,
      recordTree,
      semanticErrors,
      globalTable,
    } = evalutateText(solution);
    const testAR = evaluateModel(recordTree);
    const testRxn = testAR.getOptionalValue<TYPES.Solution>("TestSolution");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(globalTable.has("THF")).toBeTruthy();
    expect(testRxn).toBeTruthy();
    expect(testAR.getOptionalValue("THF")).toBeTruthy();
    expect(testAR.getOptionalValue("KOME")).toBeTruthy();
    expect(testAR.getOptionalValue("lLac")).toBeTruthy();
    // expect(testRxn?.components.length).toBe(3);
  });
  it.skip("evaluates a reactor graph model", () => {
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

    const {
      parserErrors,
      symbolErrors,
      recordTree,
      semanticErrors,
      globalTable,
    } = evalutateText(reactorA);

    const testAR = evaluateModel(recordTree);
    const testReactor = testAR.getOptionalValue("FlowTest");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(testReactor).toBeTruthy();
  });
  it.skip("evaluates a flow reaction model", () => {
    const flowReaction = `
      chemical pMeBnOH {
        molecular_weight: 122.16 g/mol;
        state: "solid";
        smiles: "CCCC(=O)O";
      }

      chemical kOtBu {
          molecular_weight: 112.212 g/mol;
          state: "solid";
          smiles: "CCOCC(=O)O";
      }

      chemical lLactide {
          molecular_weight: 144.12 g/mol;
          state: "solid";
          smiles: "CCOCC(=O)O";
      }

      chemical THF {
          molecular_weight: 72.11 g/mol;
          density: 0.8876 g/ml;
          state: "liquid";
          smiles: "CCNCC(=O)O";
      }

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
      }
    
      solution CatalystSolution {
        @pMeBnOH {
            mass: 488 mg;
            roles: ["initiator"];
        };

        @kOtBu {
            mass: 112 mg;
            roles: ["catalyst"];
        };

        @THF {
            volume: 10 ml;
            roles: ["solvent"];
        };
      }

     solution MonomerSolution {
        @lLactide {
            mass: 1441.2 mg;
            roles: ["monomer"];
        };

        @THF {
            volume: 10 ml;
            roles: ["solvent"];
        };
      }
    
      flow_reaction RunA {
        reactor: @FlowTest;

        @MonomerSolution {
            input: @FlowTest.MonomerTank;
            flow_rate: 10 ml/min;
        };

        @CatalystSolution {
            input: @FlowTest.CatalystTank;
            flow_rate: 10 ml/min;
        };

        @lLactide {
            roles: ["product"];
        };
      }`;

    const { parserErrors, symbolErrors, recordTree, semanticErrors } =
      evalutateText(flowReaction);

    const testAR = evaluateModel(recordTree);
    const testRxn = testAR.getOptionalValue("RunA");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(testRxn).toBeTruthy();
  });

  it("evaluates a result model", () => {
    const result = `
    chemical lLactide {
      molecular_weight: 144.12 g/mol;
      state: "solid";
      smiles: "CCOCC(=O)O";
    }

    char_data NHP-I-123-nmr {
      technique: "nmr";
      sample_id: "123-test";
      time_point: 5 s;

      @lLactide {
        conversion: 86%;
      };
    }`;

    const { parserErrors, symbolErrors, recordTree, semanticErrors } =
      evalutateText(result);

    const testAR = evaluateModel(recordTree);
    const testSample = testAR.getOptionalValue("NHP-I-123-nmr");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(testSample).toBeTruthy();
  });

  it("evaluates a polymer graph model", () => {
    const polymerGraph = `
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

    const {
      parserErrors,
      symbolErrors,
      recordTree,
      semanticErrors,
      globalTable,
    } = evalutateText(polymerGraph);

    const testAR = evaluateModel(recordTree);
    const testSample = testAR.getOptionalValue<TYPES.PolymerGraph>("egMeO_pVL");

    expect(parserErrors.length).toBe(0);
    expect(semanticErrors.length).toBe(0);
    expect(symbolErrors.length).toBe(0);
    expect(testSample).toBeTruthy();
    // expect(testSample?.graph.nodes.length).toBe(3);
    // expect(testSample?.graph.edges.length).toBe(4);
  });
});

it("evaluates a result model with a material reference", () => {
  const result = `
      fragments {
        egMeO =: "CO[R:1]";
        pL-Lac =: "[Q:1]CCCOCCC[R:1]";
      }

      polymer_graph pLactideGraph {
          nodes: [@egMeO];
          <@egMeO.R => @LactideBlock.pL-Lac.Q>;

          container LactideBlock {
              nodes: [@pL-Lac];
              <@pL-Lac.Q => @pL-Lac.R>;
          };
      }


    polymer polyL-Lactide {
          structure: @pLactideGraph;
          state: "solid";
    }

    char_data NHP-I-123-nmr {
      technique: "nmr";
      sample_id: "123-test";

      @polyL-Lactide.pLactideGraph.LactideBlock.pL-Lac {
        degree_poly: 86;
      };
    }

    char_data NHP-I-123-gpc {
      technique: "gpc";
      sample_id: "123-test";
      
      @polyL-Lactide {
        mn_avg: 10000 g/mol;
        dispersity: 1.23;
      };
    }`;

  const { parserErrors, symbolErrors, recordTree, semanticErrors } =
    evalutateText(result);

  const testAR = evaluateModel(recordTree);
  const testSample = testAR.getOptionalValue("NHP-I-123-gpc");
  expect(parserErrors.length).toBe(0);
  expect(semanticErrors.length).toBe(0);
  expect(symbolErrors.length).toBe(0);
  expect(testSample).toBeTruthy();
});

it.skip("evaluates a nested polymer graph model", () => {
  const polymerGraphGrafted = `
       fragments {
        eg_PyreneBuOH =: "[R:1]OCCCCC1=C2C(C3=C4C=C2)=C(C=CC3=CC=C4)C=C1";
        p_TMPcZ =: "O=C(O[Z:3])OCC(CO([Q:2]))(CC)COC([R:1])=O";
        p_PEO =: "[Q:1]OCC[R:1]";
        eg_MeO =: "CO[R:1]";
      }

      polymer_graph BASE {
        nodes: [ @eg_PyreneBuOH ];
        <@eg_PyreneBuOH.R => @Carbonate_Block.p_TMPcZ.R>;  

        container Carbonate_Block {
          nodes: [ @p_TMPcZ ];
          <@p_TMPcZ.Q => @p_TMPcZ.R>;
          <@PEG_GRAFT.PEG.p_PEO.Q => @p_TMPcZ.Z>;

          container PEG_GRAFT {
            nodes: [ @eg_MeO ];
            <@eg_MeO.R => @PEG.p_PEO.R>;

            container PEG {
              nodes: [ @p_PEO ];
              <@p_PEO.Q => @p_PEO.R>;
            };
          };
        };
      }`;

  const { parserErrors, symbolErrors, recordTree, semanticErrors } =
    evalutateText(polymerGraphGrafted);

  const testAR = evaluateModel(recordTree);
  const testSample = testAR.getOptionalValue<TYPES.PolymerGraph>("BASE");

  expect(parserErrors.length).toBe(0);
  expect(semanticErrors.length).toBe(0);
  expect(symbolErrors.length).toBe(0);
  expect(testSample).toBeTruthy();
  // expect(testSample?.graph.nodes.length).toBe(4);
  // expect(testSample?.graph.edges.length).toBe(5);
});
