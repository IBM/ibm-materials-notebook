import { CmdlCompiler } from "../cmdl-compiler";

function evaluateModel(text: string) {
  const document = {
    uri: "cmdl/test/uri",
    fileName: "cmdlTest.cmdl",
    version: 1,
    text,
  };
  const controller = new CmdlCompiler();
  controller.register(document);
  const errs = controller.getErrors(document.uri, document.fileName);
  const result = controller.execute(document.uri);

  return { errs, result };
}

/**
 * TODO: replace with top-level tests and mock files in cmdl-compiler.test.ts
 */
describe("Test model evaluation with compiler", () => {
  it("evaluates a solution model", () => {
    const solution = `chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
      }

      chemical KOME {
        molecular_weight: 70.132 g/mol;
      }

      chemical lLac {
        molecular_weight: 144.12 g/mol;
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

    const { errs } = evaluateModel(solution);
    expect(errs.length).toBe(0);
  });

  it("evaluates a reactor graph model", () => {
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
            target: @FlowTest.PolyReactor.Mixer;
        };

        component CatalystTank {
            description: "Tank for catalyst solution";
            target: @FlowTest.PolyReactor.Mixer;
        };
    }`;

    const { errs } = evaluateModel(reactorA);
    expect(errs.length).toBe(0);
  });

  it("evaluates a flow reaction model", () => {
    const flowReaction = `
      chemical pMeBnOH {
        molecular_weight: 122.16 g/mol;
        smiles: "CCCC(=O)O";
      }

      chemical kOtBu {
          molecular_weight: 112.212 g/mol;
          smiles: "CCOCC(=O)O";
      }

      chemical lLactide {
          molecular_weight: 144.12 g/mol;
          smiles: "CCOCC(=O)O";
      }

      chemical THF {
          molecular_weight: 72.11 g/mol;
          density: 0.8876 g/ml;
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
            target: @FlowTest.PolyReactor.Mixer;
        };

        component CatalystTank {
            description: "Tank for catalyst solution";
            target: @FlowTest.PolyReactor.Mixer;
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

    const { errs } = evaluateModel(flowReaction);
    expect(errs.length).toBe(0);
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

    const { errs } = evaluateModel(polymerGraph);
    expect(errs.length).toBe(0);
  });
});

it("evaluates a result model with a material reference", () => {
  const resultExample = `
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

  const { errs } = evaluateModel(resultExample);
  expect(errs.length).toBe(0);
});

it.skip("evaluates a nested polymer graph model", () => {
  const polymerGraphGrafted = `
       fragments {
        eg_PyreneBuOH =: "[R:1]OCCCCC1=C2C(C3=C4C=C2)=C(C=CC3=CC=C4)C=C1";
        p_TMPcZ =: "O=C(O[Z:3])OCC(CO([Q:2]))(CC)COC([R:1])=O";
        p_PEO =: "[Q:1]OCC[R:1]";
        eg_MeO =: "CO[R:1]";
      }

      polymer_graph GraftPolymer {
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

  const { errs } = evaluateModel(polymerGraphGrafted);
  console.log(JSON.stringify(errs, null, 2));
  expect(errs.length).toBe(0);
});
