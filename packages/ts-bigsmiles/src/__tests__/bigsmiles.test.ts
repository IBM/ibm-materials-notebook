import { BigSMILES } from "../bigsmiles";
import { logger } from "../logger";

function bigSmilesTestMapper(testcases: string[]) {
  for (const testcase of testcases) {
    let bigsmiles = new BigSMILES(testcase);
    logger.info(`Tree: ${bigsmiles.print()}`);
    expect(bigsmiles.toString()).toEqual(testcase);
  }
}

function parseBigSmiles(testStr: string) {
  let bigsmiles = new BigSMILES(testStr);
  // logger.info(`Tree: ${bigsmiles.print()}`);
  expect(bigsmiles.toString()).toEqual(testStr);
}

describe("Test BigSMILES parser on small molecules", () => {
  const testSMILES = [
    "c1ccc(OCCCC)cc1",
    "CC1=C(C(=NC=C1C=O)C)O",
    "C1=CC(C(C(=C1)C(=O)O)O)O",
    "C(C(=O)COP(=O)(O)O)N",
    "C1(C(C(C(C(C1O)O)OP(=O)(O)O)O)O)O",
    "C1=CC(=C(C=C1Cl)Cl)Cl",
    "CCCCCC(=O)C=CC1C(CC(=O)C1CCCCCCC(=O)O)O",
    "C1=CC(=C(C(=C1)O)O)C(=O)O",
    "CSCCC(=O)C(=COP(=O)(O)O)O",
    "C(C(C(COP(=O)(O)O)O)O)C(=O)C(=O)O",
    "CC(CC1=CC(=C(C=C1)O)O)(C(=O)OC)N",
    "C1=CC=C(C=C1)S(=O)(=O)NNC2=NC(=NC(=N2)Cl)Cl",
    "C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C(C))))))))))))))))))))C",
    "C12C3C4C1C5C4C3C25",

    // cis/trans
    //"F/C=C/F",  //trans
    //"F\C=C\F",  //trans
    //"C(\F)=C/F",  //trans
    //"F\C=C/F",  //cis
    //"F/C=C\F",  //cis
    //"C(/F)=C/F",  //cis
    //"F/C(CC)=C/F",
    //"F/C=C=C=C/F",  //trans
    //"F/C=C=C=C\F", //cis
    //"F/C=C/C/C=C\C",
    //"F/C=C/CC=CC",  //partially specifies
  ];

  it("sucessfully handles a variety of small molecule SMILES", () => {
    bigSmilesTestMapper(testSMILES);
  });
});

describe("Tests for BigSMILES parser on a variety of polymers", () => {
  const testPolymers = [
    // "[H]O{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}[H]",
    // "{[>][$]CC[$],[$]CC(CC)[$][<]}",
    // "{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}",
    // "{[>][<]C(=O)CCCCC(=O)NCCCCCCN[>][<]}",
    // "C{[$][$]CC[$],[$]CC(CC)[$][$]}",
    // "CC{[>][<]CC(C)[>][<]}CC(C)=C", //explicit end groups
    // "{[][$]CC[$],[$]CC(CC)[$][]}", //implicit end groups
    // "{[]C([$])C([$])CC[]}", //test end groups in middle
    //From BCPD
    // "CCC(C){[$][$]CC(C1CCCCC1)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][$]}[H]",
    // "{[][$]CC(c1cc(C(=O)Oc2ccc(OCCCC)cc2)ccc1(C(=O)Oc3ccc(OCCCC)cc3))[$][$]}{[>][<]Si(C)(C)O[>][]}",
    //"{[][<]CCO[>][<]}{[$][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][]}",
    //"{[][$]C\C=C/C[$],[$]C\C=C\C[$],[$]CC(C=C)[$][$]}{[>][<][Si](C)(C)O[>][]}",
    //"{[][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][$]}{[$][$]CC(c1ccccc1)[$][]}",
    // "{[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}",
    // "COCCOCCO{[>][<]CCO[>][<]}{[>][<]C(CC)CO[>][<]}[H]",
    // "{[][<]CCO[>][<]}{[>][<]C(CC)CO[>][]}",
    // "{[][$]CCCC[$],[$]CC(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}",
    //"CCC(C){[$][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][$]}{[>][<]CCO[>][<]}[H]",
    // "{[][<]C(C)C(=O)O[>][<]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}",
    //"{[][$]CC(c1ccccc1)[$][$]}{[$][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][]}",
    //"{[][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][$]}{[$][$]CC(c1ccccc1)[$][]}",
    //"[H]{[>][>]CCO[<][<]}{[$][$]C\C=C(C)/C[$],[$]C\C=C(C)\C[$],[$]CC(C(C)=C)[$],[$]CC(C)(C=C)[$][$]}C(C)CC",
    // "{[][$]CC(c1ccccc1)[$],[$]CC(c1ccc(S(=O)(=O)O)cc1)[$][$]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}",
    // "{[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}",
    // "{[][$]CC(C1CCCCC1)[$][$]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}",
    // "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}",
    // "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}",
    // "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}",
    // "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][]}",
  ];

  it("parses [H]O{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}[H]", () => {
    const bigSmiles = "[H]O{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}[H]";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[>][$]CC[$],[$]CC(CC)[$][<]}", () => {
    const bigSmiles = "{[>][$]CC[$],[$]CC(CC)[$][<]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}", () => {
    const bigSmiles = "{[>][<]C(=O)CCCCC(=O)[<],[>]NCCCCCCN[>][<]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[>][<]C(=O)CCCCC(=O)NCCCCCCN[>][<]}", () => {
    const bigSmiles = "{[>][<]C(=O)CCCCC(=O)NCCCCCCN[>][<]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses C{[$][$]CC[$],[$]CC(CC)[$][$]}", () => {
    const bigSmiles = "C{[$][$]CC[$],[$]CC(CC)[$][$]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses CC{[>][<]CC(C)[>][<]}CC(C)=C with explicit end groups", () => {
    const bigSmiles = "CC{[>][<]CC(C)[>][<]}CC(C)=C";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CC[$],[$]CC(CC)[$][]} with implicit end groups", () => {
    const bigSmiles = "{[][$]CC[$],[$]CC(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[]C([$])C([$])CC[]} with end groups in middle of string", () => {
    const bigSmiles = "{[]C([$])C([$])CC[]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses CCC(C){[$][$]CC(C1CCCCC1)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][$]}[H]", () => {
    const bigSmiles =
      "CCC(C){[$][$]CC(C1CCCCC1)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][$]}[H]";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CC(c1cc(C(=O)Oc2ccc(OCCCC)cc2)ccc1(C(=O)Oc3ccc(OCCCC)cc3))[$][$]}{[>][<]Si(C)(C)O[>][]}", () => {
    const bigSmiles =
      "{[][$]CC(c1cc(C(=O)Oc2ccc(OCCCC)cc2)ccc1(C(=O)Oc3ccc(OCCCC)cc3))[$][$]}{[>][<]Si(C)(C)O[>][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}", () => {
    const bigSmiles =
      "{[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses COCCOCCO{[>][<]CCO[>][<]}{[>][<]C(CC)CO[>][<]}[H]", () => {
    const bigSmiles = "COCCOCCO{[>][<]CCO[>][<]}{[>][<]C(CC)CO[>][<]}[H]";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][<]CCO[>][<]}{[>][<]C(CC)CO[>][]}", () => {
    const bigSmiles = "{[][<]CCO[>][<]}{[>][<]C(CC)CO[>][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CCCC[$],[$]CC(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}", () => {
    const bigSmiles =
      "{[][$]CCCC[$],[$]CC(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][<]C(C)C(=O)O[>][<]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}", () => {
    const bigSmiles =
      "{[][<]C(C)C(=O)O[>][<]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CC(c1ccccc1)[$],[$]CC(c1ccc(S(=O)(=O)O)cc1)[$][$]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}", () => {
    const bigSmiles =
      "{[][$]CC(c1ccccc1)[$],[$]CC(c1ccc(S(=O)(=O)O)cc1)[$][$]}{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}", () => {
    const bigSmiles =
      "{[][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CCCC[$],[$]CC(CC)[$][]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}", () => {
    const bigSmiles =
      "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}", () => {
    const bigSmiles =
      "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}", () => {
    const bigSmiles =
      "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][$]}";
    parseBigSmiles(bigSmiles);
  });

  it("parses {[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][]}", () => {
    const bigSmiles =
      "{[$][$]CCC(C)C[$],[$]CC(C(C)C)[$],[$]CC(C)(CC)[$][$]}{[$][$]CC(C1CCCCC1)[$][]}";
    parseBigSmiles(bigSmiles);
  });
});

describe("Tests for erroneous cases with SMILES strings", () => {
  it("throws an error for an unclosed ring", () => {
    const bigSmiles = "CCCCC1";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for unclosed branch", () => {
    const bigSmiles = "CCCC(";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a branch not started", () => {
    const bigSmiles = "CCCC)";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a double branch", () => {
    const bigSmiles = "((CC))";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a branch immediately following another branch", () => {
    const bigSmiles = "C((C)C)";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a exceeding the valence of carbon", () => {
    const bigSmiles = "C(C)(C)(C)(C)C";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });
});

describe("Tests for erroneous cases with BigSMILES strings", () => {
  const validation_cases = [
    ["CCCCC1"], // Ring not closed
    ["CCCC("], // branch not closed
    ["CCCC)"], // branch not started
    ["((CC))"], // no double branch/ extra parenthesis
    ["C((C)C)"], // no branch right away
    ["C(C)(C)(C)(C)C"], // break bond limit of carbon
    // ['C/C(\F)=C/C'], // conflicting cis/trans

    // bigsmiles
    ["CCC,C"], // stochastic seperator
    ["CC}CC"], // stochastic object no start
    ["CC{CC"], // stochastic object no end
    ["{CC}"],
    ["{[]CC[]}"],
    ["{[][$]CC[]}"],
    ["{[][>]CC[$][]}"],
    ["{[][>]CC[>][]}"],
    ["{[][>]CC[>][]}CC"], // implicit and explict end groups same time
    ["CC{[<][>]CC[>][]}CC"], // implicit and explict end groups same time
    ["{[][>]CC[>];[<]C[]}"], // only one end group provided
    ["{[][>]CC[>];[$]C[]}"],
    ["{[$1][$]CC[$][$1]}"], // index don't match
    ["{[$][<]CC[>][$]"], // end group bonding descriptor don't match stochastic fragment
  ];

  it("throws an error for a invalid stochastic separator", () => {
    const bigSmiles = "CCC,C";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with no start", () => {
    const bigSmiles = "CC}CC";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with no end", () => {
    const bigSmiles = "CC{CC";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with no bonding descriptors", () => {
    const bigSmiles = "{CC}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with no bonding descriptors", () => {
    const bigSmiles = "{CC}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with only implicit bonding descriptors", () => {
    const bigSmiles = "{[]CC[]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with missing [$] bonding descriptor", () => {
    const bigSmiles = "{[][$]CC[]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with mixed bonding descriptors", () => {
    const bigSmiles = "{[][>]CC[$][]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with no complementary bonding descriptors", () => {
    const bigSmiles = "{[][>]CC[>][]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with mixed implicit and explicit bonding descriptors", () => {
    const bigSmiles = "{[][>]CC[>][]}CC";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with mixed implicit and explicit bonding descriptors", () => {
    const bigSmiles = "CC{[<][>]CC[>][]}CC";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with only one end group provided", () => {
    const bigSmiles = "{[][>]CC[>];[<]C[]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with only one end group provided", () => {
    const bigSmiles = "{[][>]CC[>];[$]C[]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  it("throws an error for a stochastic object with unmatched indexes", () => {
    const bigSmiles = "{[$1][$]CC[$][$2]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });

  //TODO: need validation for this case
  it.skip("throws an error for a stochastic object with mixed bonding descriptors", () => {
    const bigSmiles = "{[$][<]CC[>][$]}";
    expect(() => {
      parseBigSmiles(bigSmiles);
    }).toThrow();
  });
});
