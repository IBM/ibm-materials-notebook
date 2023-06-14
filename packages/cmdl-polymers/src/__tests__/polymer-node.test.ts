import { PolymerNode } from "../node";
import Big from "big.js";

describe("Unit tests for polymer node class", () => {
  it("initializes correctly", () => {
    const polyNode = new PolymerNode({
      fragment: "Test Node A",
      smiles: "[Q:2]C(C[R:1])C1=CC=CC=C1",
      mw: Big(104.06),
    });

    expect(polyNode).toBeInstanceOf(PolymerNode);
    expect(polyNode.getSmiles()).toBe("[Q]C(C[R])C1=CC=CC=C1");
  });

  it("exports to BigSMILES a fragment with two distinct attachment points", () => {
    const polyNode = new PolymerNode({
      fragment: "Test Node A",
      smiles: "[Q:2]C(C[R:1])C1=CC=CC=C1",
      mw: Big(104.06),
    });

    expect(polyNode.exportToBigSMILES()).toBe("[<]C(C[>])C1=CC=CC=C1");
  });

  it("exports to BigSMILES a fragment with two identical attachment points", () => {
    const polyNode = new PolymerNode({
      fragment: "Test Node A",
      smiles: "[Q:2]C(C[Q:1])C1=CC=CC=C1",
      mw: Big(104.06),
    });

    expect(polyNode.exportToBigSMILES()).toBe("[$]C(C[$])C1=CC=CC=C1");
  });

  it("exports to BigSMILES a fragment with a single attachment point", () => {
    const polyNode = new PolymerNode({
      fragment: "Test Node A",
      smiles: "[Q:2]C(C)C1=CC=CC=C1",
      mw: Big(104.06),
    });

    expect(polyNode.exportToBigSMILES()).toBe("C(C)C1=CC=CC=C1");
  });
});
