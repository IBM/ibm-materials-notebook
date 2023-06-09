import { PolymerNode } from "../polymer-node";
import { Container } from "../polymer-tree-container";
import Big from "big.js";

const fragment1 = new PolymerNode({
  fragment: "Fragment 1",
  mw: Big(123),
  smiles: "[Q:2]C(C[R:1])C1=CC=CC=C1",
});

const fragment2 = new PolymerNode({
  fragment: "Fragment 2",
  mw: Big(123),
  smiles: "O=C(OC)C([Q:2])(C)C[R:1]",
});

describe.skip("Unit tests for polymer containers", () => {
  it("exports correctly to BigSMILES from a root container", () => {
    const rootContainer = new Container("ROOT");
    rootContainer.add(fragment1);
    rootContainer.add(fragment2);

    const bigSmiles = rootContainer.exportToBigSMILES();
    expect(bigSmiles).toBe(`{[][<]C(C[>])C1=CC=CC=C1, O=C(OC)C([<])(C)C[>][]}`);
  });
});
