import { PolymerContainer } from "../polymer-container";
import {
  blockCopolymer,
  multiInit,
  statMulti,
  graftedPolymer,
  dendrimer,
} from "./polymer_data";

const baseEdges = [
  {
    source: "egMeO_pVL.egMeO.R",
    target: "egMeO_pVL.BlockA.pVL.Q",
    weight: 0.3333,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockA.pVL.R",
    target: "egMeO_pVL.BlockB.pLLac.Q",
    weight: 0.3333,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockB.pLLac.Q",
    target: "egMeO_pVL.BlockB.pLLac.R",
    weight: 0,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockA.pVL.Q",
    target: "egMeO_pVL.BlockA.pVL.R",
    weight: 0,
    quantity: "1",
  },
];

const dp30Edges = [
  {
    source: "egMeO_pVL.egMeO.R",
    target: "egMeO_pVL.BlockA.pVL.Q",
    weight: 0.0159,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockA.pVL.R",
    target: "egMeO_pVL.BlockB.pLLac.Q",
    weight: 0.0159,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockB.pLLac.Q",
    target: "egMeO_pVL.BlockB.pLLac.R",
    weight: 0.4762,
    quantity: "1",
  },
  {
    source: "egMeO_pVL.BlockA.pVL.Q",
    target: "egMeO_pVL.BlockA.pVL.R",
    weight: 0.4762,
    quantity: "1",
  },
];

const multiInitBase = [
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCHexCl.R",
    weight: 0.25,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.25,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
    target: "BASE.Carbonate_Block.p_TMCHexCl.R",
    weight: 0,
    quantity: "1",
  },
];

const multiDP30 = [
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCHexCl.R",
    weight: 0.0156,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.0156,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
    target: "BASE.Carbonate_Block.p_TMCHexCl.R",
    weight: 0.4688,
    quantity: "1",
  },
];

const statMultiBase = [
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0.0625,
    quantity: "2",
  },
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0.0625,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.0625,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.0625,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0.125,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0.125,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0,
    quantity: "1",
  },
];

const statMultiBase30 = [
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0.0039,
    quantity: "2",
  },
  {
    source: "BASE.lg_BnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0.0039,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.0039,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.eg_Ac.R",
    weight: 0.0039,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0.1172,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0.1172,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.Carbonate_Block.p_TMCOctCl.R",
    weight: 0.1172,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
    target: "BASE.Carbonate_Block.p_TMCPrCl.R",
    weight: 0.1172,
    quantity: "1",
  },
];

const graftEdges = [
  {
    source: "BASE.lg_pMeBnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0.0417,
    quantity: "2",
  },
  {
    source: "BASE.lg_pMeBnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0.0417,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0.0833,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBn.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0.0833,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBn.Q",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Z",
    weight: 0.0833,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.eg_MeO.R",
    target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
    weight: 0.0833,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
    target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
    weight: 0,
    quantity: "1",
  },
];
const graftEdgesWeighted = [
  {
    source: "BASE.lg_pMeBnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0.0001,
    quantity: "2",
  },
  {
    source: "BASE.lg_pMeBnMPA.R",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0.0001,
    quantity: "2",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0.0021,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0.0021,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBn.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
    weight: 0.0021,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.p_TMCBn.Q",
    target: "BASE.Carbonate_Block.p_TMCBn.R",
    weight: 0.0021,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
    target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Z",
    weight: 0.0042,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.eg_MeO.R",
    target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
    weight: 0.0042,
    quantity: "1",
  },
  {
    source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
    target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
    weight: 0.4825,
    quantity: "1",
  },
];

const dendrimerEdges = [
  {
    source: "BASE.eg_111Tris4hydroxyphenylethane.R",
    target: "BASE.BisMPA-1.b_BisMPA.Q",
    weight: 0.0035,
    quantity: "3",
  },
  {
    source: "BASE.BisMPA-1.b_BisMPA.R",
    target: "BASE.BisMPA-2.b_BisMPA.Q",
    weight: 0.0035,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-2.b_BisMPA.R",
    target: "BASE.BisMPA-3.b_BisMPA.Q",
    weight: 0.0035,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-3.b_BisMPA.R",
    target: "BASE.BisMPA-4.b_BisMPA.Q",
    weight: 0.0035,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-4.b_BisMPA.R",
    target: "BASE.Lactide_Block.p_Llac.R",
    weight: 0.0035,
    quantity: "2",
  },
  {
    source: "BASE.Lactide_Block.p_Llac.Q",
    target: "BASE.Lactide_Block.p_Llac.R",
    weight: 0,
    quantity: "1",
  },
];

const dendrimerEdgesWeighted = [
  {
    source: "BASE.eg_111Tris4hydroxyphenylethane.R",
    target: "BASE.BisMPA-1.b_BisMPA.Q",
    weight: 0.0006,
    quantity: "3",
  },
  {
    source: "BASE.BisMPA-1.b_BisMPA.R",
    target: "BASE.BisMPA-2.b_BisMPA.Q",
    weight: 0.0006,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-2.b_BisMPA.R",
    target: "BASE.BisMPA-3.b_BisMPA.Q",
    weight: 0.0006,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-3.b_BisMPA.R",
    target: "BASE.BisMPA-4.b_BisMPA.Q",
    weight: 0.0006,
    quantity: "2",
  },
  {
    source: "BASE.BisMPA-4.b_BisMPA.R",
    target: "BASE.Lactide_Block.p_Llac.R",
    weight: 0.0006,
    quantity: "2",
  },
  {
    source: "BASE.Lactide_Block.p_Llac.Q",
    target: "BASE.Lactide_Block.p_Llac.R",
    weight: 0.0174,
    quantity: "1",
  },
];

describe("Tests for weighting a block copolymer polymer graph", () => {
  it("provides the base graph without DP values", () => {
    const polymer = new PolymerContainer(blockCopolymer.tree.name);
    polymer.initializeTreeFromJSON(blockCopolymer.tree);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(baseEdges);
  });

  it("correctly weights edges with equal DP", () => {
    const polymer = new PolymerContainer(blockCopolymer.tree.name);
    polymer.initializeTreeFromJSON(blockCopolymer.tree);
    const values = [
      {
        name: "egMeO_pVL",
        path: ["BlockA", "pVL"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
      {
        name: "egMeO_pVL",
        path: ["BlockB", "pLLac"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
    ];
    polymer.addGraphValues(values);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(dp30Edges);
  });
});

describe("Tests for weighting a polymer with multifuncitional initiator", () => {
  it("provides the base graph without DP values", () => {
    const polymer = new PolymerContainer(multiInit.tree.name);
    polymer.initializeTreeFromJSON(multiInit.tree);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(multiInitBase);
  });

  it("correctly weights edges with equal DP", () => {
    const polymer = new PolymerContainer(multiInit.tree.name);
    polymer.initializeTreeFromJSON(multiInit.tree);
    const values = [
      {
        name: "BASE",
        path: ["Carbonate_Block", "p_TMCHexCl"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
    ];
    polymer.addGraphValues(values);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(multiDP30);
  });
});

describe("Tests for weighting a statistical co-polymer with multifuncitional initiator", () => {
  it("provides the base graph without DP values", () => {
    const polymer = new PolymerContainer(statMulti.tree.name);
    polymer.initializeTreeFromJSON(statMulti.tree);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(statMultiBase);
  });

  it("correctly weights edges with equal DP", () => {
    const polymer = new PolymerContainer(statMulti.tree.name);
    polymer.initializeTreeFromJSON(statMulti.tree);
    const values = [
      {
        name: "BASE",
        path: ["Carbonate_Block", "p_TMCOctCl"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
      {
        name: "BASE",
        path: ["Carbonate_Block", "p_TMCPrCl"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
    ];

    polymer.addGraphValues(values);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(statMultiBase30);
  });
});

describe("Tests for weighting a grafted statistical co-polymer with multifuncitional initiator", () => {
  it("provides the base graph without DP values", () => {
    const polymer = new PolymerContainer(graftedPolymer.name);
    polymer.initializeTreeFromJSON(graftedPolymer);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(graftEdges);
  });

  it("correctly weights edges with equal DP", () => {
    const polymer = new PolymerContainer(graftedPolymer.name);
    polymer.initializeTreeFromJSON(graftedPolymer);
    const values = [
      {
        name: "BASE",
        path: ["Carbonate_Block", "p_TMCBn"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
      {
        name: "BASE",
        path: ["Carbonate_Block", "p_TMCBnTriazolZ"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
      {
        name: "BASE",
        path: ["Carbonate_Block", "PEG_Graft", "PEG", "p_PEO"],
        value: {
          unit: null,
          value: 113.7,
          uncertainty: null,
        },
      },
    ];
    polymer.addGraphValues(values);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(graftEdgesWeighted);
  });
});
describe("Tests for weighting a dendrimer initiated polymer", () => {
  it("provides the base graph without DP values", () => {
    const polymer = new PolymerContainer(dendrimer.name);
    polymer.initializeTreeFromJSON(dendrimer);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(dendrimerEdges);
  });

  it("correctly weights edges with equal DP", () => {
    const polymer = new PolymerContainer(dendrimer.name);
    polymer.initializeTreeFromJSON(dendrimer);
    const values = [
      {
        name: "BASE",
        path: ["Lactide_Block", "p_Llac"],
        value: {
          unit: null,
          value: 30,
          uncertainty: null,
        },
      },
    ];
    polymer.addGraphValues(values);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(dendrimerEdgesWeighted);
  });
});
