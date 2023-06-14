import { ModelType, CMDL } from "cmdl-types";
import { JSONPolymerGraphStructure, PolymerContainer } from "../container";

export const blockCopolymer: JSONPolymerGraphStructure = {
  name: "egMeO_pVL",
  type: ModelType.POLYMER_GRAPH,
  tree: {
    name: "egMeO_pVL",
    connections: [
      {
        source: "egMeO_pVL.egMeO.R",
        target: "egMeO_pVL.BlockA.pVL.Q",
        weight: 0.4167,
        quantity: "1",
      },
      {
        source: "egMeO_pVL.BlockA.pVL.R",
        target: "egMeO_pVL.BlockB.pLLac.Q",
        weight: 0.4167,
        quantity: "1",
      },
    ],
    parent: null,
    children: [
      {
        name: "egMeO_pVL.egMeO",
        mw: 100,
        smiles: "CO[R:1]",
        parent: "egMeO_pVL",
      },
      {
        name: "BlockB",
        connections: [
          {
            source: "egMeO_pVL.BlockB.pLLac.Q",
            target: "egMeO_pVL.BlockB.pLLac.R",
            weight: 0,
            quantity: "1",
          },
        ],
        parent: "egMeO_pVL",
        children: [
          {
            name: "egMeO_pVL.BlockB.pLLac",
            mw: 100,
            smiles: "[Q:1]CCCOCCC[R:1]",
            parent: "BlockB",
          },
        ],
      },
      {
        name: "BlockA",
        connections: [
          {
            source: "egMeO_pVL.BlockA.pVL.Q",
            target: "egMeO_pVL.BlockA.pVL.R",
            weight: 0,
            quantity: "1",
          },
        ],
        parent: "egMeO_pVL",
        children: [
          {
            name: "egMeO_pVL.BlockA.pVL",
            mw: 100,
            smiles: "[Q:1]CCCCC[R:1]",
            parent: "BlockA",
          },
        ],
      },
    ],
  },
};

export const multiInit = {
  name: "BASE",
  type: ModelType.POLYMER_GRAPH,
  tree: {
    name: "BASE",
    connections: [
      {
        source: "BASE.lg_BnMPA.R",
        target: "BASE.Carbonate_Block.p_TMCHexCl.R",
        weight: 1,
        quantity: "2",
      },
      {
        source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
        target: "BASE.eg_Ac.R",
        weight: 1,
        quantity: "1",
      },
    ],
    parent: null,
    children: [
      {
        name: "BASE.lg_BnMPA",
        mw: 222.1,
        smiles: "[R:1]OCC(C)(CO[R:1])C(OCC1=CC=CC=C1)=O",
        parent: "BASE",
      },
      {
        name: "BASE.eg_Ac",
        mw: 43.49,
        smiles: "O=C([R:1])C",
        parent: "BASE",
      },
      {
        name: "Carbonate_Block",
        connections: [
          {
            source: "BASE.Carbonate_Block.p_TMCHexCl.Q",
            target: "BASE.Carbonate_Block.p_TMCHexCl.R",
            weight: 1,
            quantity: "1",
          },
        ],
        parent: "BASE",
        children: [
          {
            name: "BASE.Carbonate_Block.p_TMCHexCl",
            mw: 278.09,
            smiles: "ClCCCCCCOC(C(C)(CO[Q:2])COC([R:1])=O)=O",
            parent: "Carbonate_Block",
          },
        ],
      },
    ],
  },
};

export const statMulti = {
  name: "Base",
  type: ModelType.POLYMER_GRAPH,
  tree: {
    name: "BASE",
    connections: [
      {
        source: "BASE.lg_BnMPA.R",
        target: "BASE.Carbonate_Block.p_TMCOctCl.R",
        weight: 1,
        quantity: "2",
      },
      {
        source: "BASE.lg_BnMPA.R",
        target: "BASE.Carbonate_Block.p_TMCPrCl.R",
        weight: 1,
        quantity: "2",
      },
      {
        source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
        target: "BASE.eg_Ac.R",
        weight: 1,
        quantity: "1",
      },
      {
        source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
        target: "BASE.eg_Ac.R",
        weight: 1,
        quantity: "1",
      },
    ],
    parent: null,
    children: [
      {
        name: "BASE.lg_BnMPA",
        mw: 222.1,
        smiles: "[R:1]OCC(C)(CO[R:1])C(OCC1=CC=CC=C1)=O",
        parent: "BASE",
      },
      {
        name: "BASE.eg_Ac",
        mw: 43.49,
        smiles: "O=C([R:1])C",
        parent: "BASE",
      },
      {
        name: "Carbonate_Block",
        connections: [
          {
            source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
            target: "BASE.Carbonate_Block.p_TMCOctCl.R",
            weight: 1,
            quantity: "1",
          },
          {
            source: "BASE.Carbonate_Block.p_TMCOctCl.Q",
            target: "BASE.Carbonate_Block.p_TMCPrCl.R",
            weight: 1,
            quantity: "1",
          },
          {
            source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
            target: "BASE.Carbonate_Block.p_TMCOctCl.R",
            weight: 1,
            quantity: "1",
          },
          {
            source: "BASE.Carbonate_Block.p_TMCPrCl.Q",
            target: "BASE.Carbonate_Block.p_TMCPrCl.R",
            weight: 1,
            quantity: "1",
          },
        ],
        parent: "BASE",
        children: [
          {
            name: "BASE.Carbonate_Block.p_TMCOctCl",
            mw: 306.12,
            smiles: "ClCCCCCCCCOC(C(C)(CO[Q:2])COC([R:1])=O)=O",
            parent: "Carbonate_Block",
          },
          {
            name: "BASE.Carbonate_Block.p_TMCPrCl",
            mw: 236.05,
            smiles: "ClCCCOC(C(C)(CO[Q:2])COC([R:1])=O)=O",
            parent: "Carbonate_Block",
          },
        ],
      },
    ],
  },
};

export const graftedPolymer = {
  name: "BASE",
  connections: [
    {
      source: "BASE.lg_pMeBnMPA.R",
      target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
      weight: 1,
      quantity: "2",
    },
    {
      source: "BASE.lg_pMeBnMPA.R",
      target: "BASE.Carbonate_Block.p_TMCBn.R",
      weight: 1,
      quantity: "2",
    },
  ],
  parent: null,
  children: [
    {
      name: "BASE.lg_pMeBnMPA",
      mw: 236.12,
      smiles: "CC(CO[R:1])(CO[R:1])C(OCC1=CC=C(C)C=C1)=O",
      parent: "BASE",
    },
    {
      name: "Carbonate_Block",
      connections: [
        {
          source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
          target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
          weight: 1,
          quantity: "1",
        },
        {
          source: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Q",
          target: "BASE.Carbonate_Block.p_TMCBn.R",
          weight: 1,
          quantity: "1",
        },
        {
          source: "BASE.Carbonate_Block.p_TMCBn.Q",
          target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.R",
          weight: 1,
          quantity: "1",
        },
        {
          source: "BASE.Carbonate_Block.p_TMCBn.Q",
          target: "BASE.Carbonate_Block.p_TMCBn.R",
          weight: 1,
          quantity: "1",
        },
        {
          source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
          target: "BASE.Carbonate_Block.p_TMCBnTriazolZ.Z",
          weight: 1,
          quantity: "1",
        },
      ],
      parent: "BASE",
      children: [
        {
          name: "BASE.Carbonate_Block.p_TMCBnTriazolZ",
          mw: 344.12,
          smiles:
            "C1=C(C[Z:3])N=NN1CC(C=C1)=CC=C1COC(C(C)(CO[Q:2])COC([R:1])=O)=O",
          parent: "Carbonate_Block",
        },
        {
          name: "BASE.Carbonate_Block.p_TMCBn",
          mw: 250.08,
          smiles: "CC(CO[Q:2])(C(OCC1=CC=CC=C1)=O)COC([R:1])=O",
          parent: "Carbonate_Block",
        },
        {
          name: "PEG_Graft",
          connections: [
            {
              source: "BASE.Carbonate_Block.PEG_Graft.eg_MeO.R",
              target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
              weight: 1,
              quantity: "1",
            },
          ],
          parent: "Carbonate_Block",
          children: [
            {
              name: "BASE.Carbonate_Block.PEG_Graft.eg_MeO",
              mw: 31.02,
              smiles: "CO[R:1]",
              parent: "PEG_Graft",
            },
            {
              name: "PEG",
              connections: [
                {
                  source: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.Q",
                  target: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO.R",
                  weight: 1,
                  quantity: "1",
                },
              ],
              parent: "PEG_Graft",
              children: [
                {
                  name: "BASE.Carbonate_Block.PEG_Graft.PEG.p_PEO",
                  mw: 44.05,
                  smiles: "[Q:1]OCC[R:1]",
                  parent: "PEG",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const dendrimer = {
  name: "BASE",
  connections: [
    {
      source: "BASE.eg_111Tris4hydroxyphenylethane.R",
      target: "BASE.BisMPA-1.b_BisMPA.Q",
      weight: 1,
      quantity: "3",
    },
    {
      source: "BASE.BisMPA-1.b_BisMPA.R",
      target: "BASE.BisMPA-2.b_BisMPA.Q",
      weight: 1,
      quantity: "2",
    },
    {
      source: "BASE.BisMPA-2.b_BisMPA.R",
      target: "BASE.BisMPA-3.b_BisMPA.Q",
      weight: 1,
      quantity: "2",
    },
    {
      source: "BASE.BisMPA-3.b_BisMPA.R",
      target: "BASE.BisMPA-4.b_BisMPA.Q",
      weight: 1,
      quantity: "2",
    },
    {
      source: "BASE.BisMPA-4.b_BisMPA.R",
      target: "BASE.Lactide_Block.p_Llac.R",
      weight: 1,
      quantity: "2",
    },
  ],
  parent: null,
  children: [
    {
      name: "BASE.eg_111Tris4hydroxyphenylethane",
      mw: 303.4,
      smiles: "CC(C1=CC=C(C=C1)O[R:1])(C2=CC=C(C=C2)O[R:1])C3=CC=C(C=C3)O[R:1]",
      parent: "BASE",
    },
    {
      name: "Lactide_Block",
      connections: [
        {
          source: "BASE.Lactide_Block.p_Llac.Q",
          target: "BASE.Lactide_Block.p_Llac.R",
          weight: 1,
          quantity: "1",
        },
      ],
      parent: "BASE",
      children: [
        {
          name: "BASE.Lactide_Block.p_Llac",
          mw: 144.04,
          smiles: "O=C(O[C@H](C([R:1])=O)C)[C@@H](O[Q:2])C",
          parent: "Lactide_Block",
        },
      ],
    },
    {
      name: "BisMPA-4",
      connections: [],
      parent: "BASE",
      children: [
        {
          name: "BASE.BisMPA-4.b_BisMPA",
          mw: 118.13,
          smiles: "CC(CO[R:1])(CO[R:1])C(=O)([Q:2])",
          parent: "BisMPA-4",
        },
      ],
    },
    {
      name: "BisMPA-3",
      connections: [],
      parent: "BASE",
      children: [
        {
          name: "BASE.BisMPA-3.b_BisMPA",
          mw: 118.13,
          smiles: "CC(CO[R:1])(CO[R:1])C(=O)([Q:2])",
          parent: "BisMPA-3",
        },
      ],
    },
    {
      name: "BisMPA-2",
      connections: [],
      parent: "BASE",
      children: [
        {
          name: "BASE.BisMPA-2.b_BisMPA",
          mw: 118.13,
          smiles: "CC(CO[R:1])(CO[R:1])C(=O)([Q:2])",
          parent: "BisMPA-2",
        },
      ],
    },
    {
      name: "BisMPA-1",
      connections: [],
      parent: "BASE",
      children: [
        {
          name: "BASE.BisMPA-1.b_BisMPA",
          mw: 118.13,
          smiles: "CC(CO[R:1])(CO[R:1])C(=O)([Q:2])",
          parent: "BisMPA-1",
        },
      ],
    },
  ],
};

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
    polymer.addGraphValues(values as CMDL.RefResult[]);
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
    polymer.addGraphValues(values as CMDL.RefResult[]);
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

    polymer.addGraphValues(values as CMDL.RefResult[]);
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
    polymer.addGraphValues(values as CMDL.RefResult[]);
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
    polymer.addGraphValues(values as CMDL.RefResult[]);
    polymer.computePolymerWeights();

    const graph = polymer.graphToJSON();

    expect(graph.edges).toEqual(dendrimerEdgesWeighted);
  });
});
