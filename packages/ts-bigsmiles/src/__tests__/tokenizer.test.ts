import { tokenize, Token, TokenKind } from "../tokenizer";

function testMapper(testArr: [string, TokenKind[]][]) {
  for (const test of testArr) {
    let tokenizerResult = tokenize(test[0]);
    let tokenizerResultKind = tokenizerResult.map((el) => el.kind);
    expect(tokenizerResultKind).toEqual(test[1]);
  }
}

describe("Tests for tokenizer on atoms", () => {
  const atomTests: [string, TokenKind[]][] = [
    ["Zn", [TokenKind.Atom]],
    ["C", [TokenKind.Atom]],
    ["CCC", [TokenKind.Atom, TokenKind.Atom, TokenKind.Atom]],
    ["c", [TokenKind.Aromatic]],
    ["[C@]", [TokenKind.AtomExtend]],
    ["[C@@]", [TokenKind.AtomExtend]],
    ["[Fe+]", [TokenKind.AtomExtend]],
    ["[Fe++]", [TokenKind.AtomExtend]],
    ["[Fe+2]", [TokenKind.AtomExtend]],
    ["[OH3+]", [TokenKind.AtomExtend]],
  ];

  it("tokenizes a variety of atom types", () => {
    testMapper(atomTests);
  });
});

describe("Tests for tokenizer on rings", () => {
  const ringTests: [string, TokenKind[]][] = [
    ["C1C", [TokenKind.Atom, TokenKind.Ring, TokenKind.Atom]],
    ["C7C", [TokenKind.Atom, TokenKind.Ring, TokenKind.Atom]],
    ["C77C", [TokenKind.Atom, TokenKind.Ring, TokenKind.Ring, TokenKind.Atom]],
    ["C%77C", [TokenKind.Atom, TokenKind.Ring2, TokenKind.Atom]],
  ];

  it("tokenizes various ring definitions", () => {
    testMapper(ringTests);
  });
});

describe("Tests for tokenizer on bonds", () => {
  const bondTests: [string, TokenKind[]][] = [
    ["C=C", [TokenKind.Atom, TokenKind.Bond, TokenKind.Atom]],
    ["C#N", [TokenKind.Atom, TokenKind.Bond, TokenKind.Atom]],
    [
      "C/C=C/C",
      [
        TokenKind.Atom,
        TokenKind.BondEZ,
        TokenKind.Atom,
        TokenKind.Bond,
        TokenKind.Atom,
        TokenKind.BondEZ,
        TokenKind.Atom,
      ],
    ],
  ];

  it("tokenizes various bond types", () => {
    testMapper(bondTests);
  });
});

describe("Tests for tokenizer on branches", () => {
  const branchTests: [string, TokenKind[]][] = [
    ["(", [TokenKind.BranchStart]],
    [")", [TokenKind.BranchEnd]],
    [
      "C(C)C",
      [
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.Atom,
        TokenKind.BranchEnd,
        TokenKind.Atom,
      ],
    ],
  ];

  it("tokenizes various branch definitions", () => {
    testMapper(branchTests);
  });
});

describe("Tests for tokenizer on mixtures", () => {
  const mixTests: [string, TokenKind[]][] = [
    [".", [TokenKind.Mix]],
    ["C.C", [TokenKind.Atom, TokenKind.Mix, TokenKind.Atom]],
  ];

  it("tokenizes various mixture definitions", () => {
    testMapper(mixTests);
  });
});

describe("Tests for tokenizer on reactions", () => {
  const rxnTests: [string, TokenKind[]][] = [
    [
      "C>CC>>CCC",
      [
        TokenKind.Atom,
        TokenKind.Rxn,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Rxn,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
      ],
    ],
  ];

  it("tokenizes various reaction definitions", () => {
    testMapper(rxnTests);
  });
});

describe("Tests for tokenizer on bonding descriptors", () => {
  const bdTests: [string, TokenKind[]][] = [
    ["[>]", [TokenKind.BondDescriptor]],
    ["[<]", [TokenKind.BondDescriptor]],
    ["[$]", [TokenKind.BondDescriptor]],
    ["[>1]", [TokenKind.BondDescriptor]],
    ["[>12]", [TokenKind.BondDescriptor]],
    [
      "[$]CCC(=[$])C[$]",
      [
        TokenKind.BondDescriptor,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.Bond,
        TokenKind.BondDescriptor,
        TokenKind.BranchEnd,
        TokenKind.Atom,
        TokenKind.BondDescriptor,
      ],
    ],
    [
      "[H]O{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}[H]",
      [
        TokenKind.AtomExtend,
        TokenKind.Atom,
        TokenKind.StochasticStart,
        TokenKind.BondDescriptor,
        TokenKind.BondDescriptor,
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.Bond,
        TokenKind.Atom,
        TokenKind.BranchEnd,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.Bond,
        TokenKind.Atom,
        TokenKind.BranchEnd,
        TokenKind.BondDescriptor,
        TokenKind.StochasticSeperator,
        TokenKind.BondDescriptor,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BondDescriptor,
        TokenKind.BondDescriptor,
        TokenKind.StochasticEnd,
        TokenKind.AtomExtend,
      ],
    ],
  ];

  it("tokenizes various bonding descriptor definitions definitions", () => {
    testMapper(bdTests);
  });
});

describe("Tests for tokenizer on ladders", () => {
  const ladderTests: [string, TokenKind[]][] = [
    ["[$1[$2]1]", [TokenKind.BondDescriptorLadder]],
    [
      "{[]CCC([$1[$1]1])CC(OC[$1[$2]1])(CC[$1[$1]2])OC[$1[$2]2][]}",
      [
        TokenKind.StochasticStart,
        TokenKind.ImplictEndGroup,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.BondDescriptorLadder,
        TokenKind.BranchEnd,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BranchStart,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BondDescriptorLadder,
        TokenKind.BranchEnd,
        TokenKind.BranchStart,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BondDescriptorLadder,
        TokenKind.BranchEnd,
        TokenKind.Atom,
        TokenKind.Atom,
        TokenKind.BondDescriptorLadder,
        TokenKind.ImplictEndGroup,
        TokenKind.StochasticEnd,
      ],
    ],
  ];

  it("tokenizes various ladder definitions", () => {
    testMapper(ladderTests);
  });
});

describe("Tests for tokenizer on stochastic symbols", () => {
  const ladderTests: [string, TokenKind[]][] = [
    ["C,C", [TokenKind.Atom, TokenKind.StochasticSeperator, TokenKind.Atom]],
    ["C;C", [TokenKind.Atom, TokenKind.StochasticSeperator, TokenKind.Atom]],
    ["C{C", [TokenKind.Atom, TokenKind.StochasticStart, TokenKind.Atom]],
    ["C}C", [TokenKind.Atom, TokenKind.StochasticEnd, TokenKind.Atom]],
  ];

  it("tokenizes various stochastic symbols definitions", () => {
    testMapper(ladderTests);
  });
});

describe("Tests for invalid tokens", () => {
  const invalidTests = ["E", "%", "[C<]"];

  it("throws error on invalid symbols", () => {
    for (const invalid of invalidTests) {
      expect(() => tokenize(invalid)).toThrowError();
    }
  });
});

describe("tests for tokenizer", () => {
  it("tokenizes a BigSmiles string", () => {
    const test_polymer = "CC{[>][<]CC(C)[>][<]}CC(C)=C";
    const output = tokenize(test_polymer);
    expect(output.length).toBe(20);

    output.forEach((token) => {
      expect(token).toBeInstanceOf(Token);
    });
  });
});
