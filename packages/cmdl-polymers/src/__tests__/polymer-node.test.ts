import { PolymerNode } from "../node";

describe("Unit tests for polymer node class", () => {
  it("initializes correctly", () => {
    const polyNode = new PolymerNode(
      "Test Node A",
      "[Q:2]C(C[R:1])C1=CC=CC=C1"
    );

    expect(polyNode).toBeInstanceOf(PolymerNode);
    expect(polyNode.smiles).toBe("[Q:2]C(C[R:1])C1=CC=CC=C1");
  });
});
