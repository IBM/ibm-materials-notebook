import { Atom } from "../atom";

describe("Tests for the Atom class", () => {
  it("can process simple atom strings", () => {
    const testAtom = "C";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes atoms with isotopes", () => {
    const testAtom = "[235U]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes atoms with single hydrogens", () => {
    const testAtom = "[NH]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes atoms with multiple hydrogens", () => {
    const testAtom = "[NH2]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes postively charged atoms with numeric values (Cu+2)", () => {
    const testAtom = "[Cu+2]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes postively charged atoms with multiple signs (Fe+++)", () => {
    const testAtom = "[Fe+++]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe("[Fe+3]");
  });

  it("processes negatively charged atoms with numeric values (Cl-)", () => {
    const testAtom = "[Cl-]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes negatively charged atoms with hydrogens (NH2-)", () => {
    const testAtom = "[NH2-]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });

  it("processes positively charged atoms with hydrogens (OH3+)", () => {
    const testAtom = "[OH3+]";
    const atom = new Atom(testAtom, 1);
    expect(atom.toString()).toBe(testAtom);
  });
});
