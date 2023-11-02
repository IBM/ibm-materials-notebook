import ChemicalSet from "../chemical-set";
import Big from "big.js";
import { solidChemicalMass } from "./chemical.test";
import Solid from "../solid";
import { PROPERTIES, TAGS, TYPES } from "../../cmdl-types";

const catalyst: TYPES.ChemicalConfig = {
  name: "KOME",
  mw: Big(70.132),
  density: null,
  state: TYPES.ChemStates.SOLID,
  quantity: {
    name: PROPERTIES.MASS,
    value: Big("1"),
    unit: "mg",
    uncertainty: null,
  },
  roles: [TAGS.CATALYST, TAGS.INITIATOR],
  limiting: true,
};

const solvent: TYPES.ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: TYPES.ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.VOLUME,
    value: Big("1"),
    unit: "ml",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

describe("Tests for Chemical Set", () => {
  it("adds a chemical", () => {
    const reaction = new ChemicalSet();
    reaction.insert(solidChemicalMass);
    const chemicals = reaction.chemicals;
    expect(chemicals.length).toBe(1);
    expect(chemicals[0]).toBeInstanceOf(Solid);
  });

  it("computes values for a chemical set", () => {
    const reaction = new ChemicalSet();
    reaction.insert(solidChemicalMass);
    reaction.insert(catalyst);
    reaction.insert(solvent);
    const output = reaction.computeChemicalValues();
    expect(output.length).toBe(3);
    expect(output[0].ratio).toBe(57.41);
  });
});
