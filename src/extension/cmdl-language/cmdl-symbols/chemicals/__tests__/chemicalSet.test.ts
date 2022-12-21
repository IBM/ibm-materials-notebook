import ChemicalSet from "../chemical-set";
import { ChemPropKey } from "../base-chemical";
import { ChemicalConfig, ChemStates } from "../chemical-factory";
import Big from "big.js";
import { solidChemicalMass } from "./chemical.test";
import Solid from "../solid";

const catalyst: ChemicalConfig = {
  name: "KOME",
  mw: Big(70.132),
  density: null,
  state: ChemStates.SOLID,
  quantity: {
    name: ChemPropKey.MASS,
    value: Big("1"),
    unit: "mg",
    uncertainty: null,
  },
  roles: ["catalyst", "initiator"],
  limiting: true,
};

const solvent: ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: ChemStates.LIQUID,
  quantity: {
    name: ChemPropKey.VOLUME,
    value: Big("1"),
    unit: "ml",
    uncertainty: null,
  },
  roles: ["solvent"],
  limiting: false,
};

describe("Tests for Chemical Set", () => {
  it("adds a chemical", () => {
    const reaction = new ChemicalSet();
    reaction.insert(solidChemicalMass);
    let chemicals = reaction.chemicals;
    expect(chemicals.length).toBe(1);
    expect(chemicals[0]).toBeInstanceOf(Solid);
  });

  it.skip("merges duplicate chemicals with different units", () => {
    let testSet = new ChemicalSet();
  });

  it("computes values for a chemical set", () => {
    let reaction = new ChemicalSet();
    reaction.insert(solidChemicalMass);
    reaction.insert(catalyst);
    reaction.insert(solvent);
    let output = reaction.computeChemicalValues();
    expect(output.length).toBe(3);
    expect(output[0].ratio).toBe(57.41);
  });

  it.skip("generates a new chemical set from a volume input", () => {
    let testSet = new ChemicalSet();
  });
});
