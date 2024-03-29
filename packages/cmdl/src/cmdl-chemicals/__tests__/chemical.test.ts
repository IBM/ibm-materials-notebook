import Big from "big.js";
import { UNITS, TYPES, PROPERTIES, TAGS } from "../../cmdl-types";
import ChemicalFactory from "../chemical-factory";
import Gas from "../gas";
import Liquid from "../liquid";
import Solid from "../solid";

export const solidChemicalMass: TYPES.ChemicalConfig = {
  name: "p-methylbenzyl alcohol",
  mw: Big(122.16),
  density: null,
  state: TYPES.ChemStates.SOLID,
  quantity: {
    name: PROPERTIES.MASS,
    value: Big("100"),
    unit: "mg",
    uncertainty: null,
  },
  roles: [TAGS.INITIATOR],
  limiting: true,
};

const solidChemicalMoles: TYPES.ChemicalConfig = {
  name: "p-methylbenzyl alcohol",
  mw: Big(122.16),
  density: null,
  state: TYPES.ChemStates.SOLID,
  quantity: {
    name: PROPERTIES.MOLES,
    value: Big("100"),
    unit: "mmol",
    uncertainty: null,
  },
  roles: [TAGS.INITIATOR],
  limiting: false,
};

const liquidChemicalMoles: TYPES.ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: TYPES.ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.MOLES,
    value: Big("10"),
    unit: "mol",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

const liquidChemicalMass: TYPES.ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: TYPES.ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.MASS,
    value: Big("20"),
    unit: "kg",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

const liquidChemicalVol: TYPES.ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: TYPES.ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.VOLUME,
    value: Big("300"),
    unit: "ml",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

const liquidChemicalNoDensity: TYPES.ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: null,
  state: TYPES.ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.VOLUME,
    value: Big("300"),
    unit: "ml",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

const gasChemical: TYPES.ChemicalConfig = {
  name: "CO2",
  mw: Big(44.01),
  density: null,
  state: TYPES.ChemStates.GAS,
  quantity: {
    name: PROPERTIES.PRESSURE,
    value: Big("300"),
    unit: "atm",
    uncertainty: null,
  },
  temperature: {
    uncertainty: null,
    unit: "degC",
    value: Big("85"),
  },
  volume: {
    uncertainty: null,
    unit: "ml",
    value: Big("500"),
  },
  roles: [TAGS.ATMOSPHERE],
  limiting: false,
};

const gasChemicalNoVol: TYPES.ChemicalConfig = {
  name: "CO2",
  mw: Big(44.01),
  density: null,
  state: TYPES.ChemStates.GAS,
  quantity: {
    name: PROPERTIES.PRESSURE,
    value: Big("300"),
    unit: "atm",
    uncertainty: null,
  },
  temperature: {
    uncertainty: null,
    unit: "degC",
    value: Big("85"),
  },
  roles: [TAGS.ATMOSPHERE],
  limiting: false,
};

const gasChemicalNoTemp: TYPES.ChemicalConfig = {
  name: "CO2",
  mw: Big(44.01),
  density: null,
  state: TYPES.ChemStates.GAS,
  quantity: {
    name: PROPERTIES.PRESSURE,
    value: Big("300"),
    unit: "atm",
    uncertainty: null,
  },
  volume: {
    uncertainty: null,
    unit: "ml",
    value: Big("500"),
  },
  roles: [TAGS.ATMOSPHERE],
  limiting: false,
};

const factory = new ChemicalFactory();

describe("Tests for chemical factory", () => {
  it("creates a solid reagent with a mass value", () => {
    const solid = factory.create(solidChemicalMass);
    expect(solid).toBeInstanceOf(Solid);
    expect(solid.mass?.value.toNumber()).toBeCloseTo(100);
    expect(solid.mass?.unit).toBe("mg");
    expect(solid.moles?.value.toNumber()).toBeCloseTo(0.8186);
    expect(solid.moles?.unit).toBe("mmol");
    expect(solid.solidVol?.value.toNumber()).toBeCloseTo(100);
    expect(solid.solidVol?.unit).toBe("mcl");
  });

  it("creates a solid reagent with a moles value", () => {
    const solid = factory.create(solidChemicalMoles);
    expect(solid).toBeInstanceOf(Solid);
    expect(solid.mass?.value.toNumber()).toBeCloseTo(12216);
    expect(solid.mass?.unit).toBe("mg");
    expect(solid.moles?.value.toNumber()).toBeCloseTo(100);
    expect(solid.moles?.unit).toBe("mmol");
    expect(solid.solidVol?.value.toNumber()).toBeCloseTo(12216);
    expect(solid.solidVol?.unit).toBe("mcl");
  });

  it("creates a liquid reagent from a mass value", () => {
    const liquid = factory.create(liquidChemicalMass);
    expect(liquid).toBeInstanceOf(Liquid);
    expect(liquid.mass?.value.toNumber()).toBeCloseTo(20);
    expect(liquid.mass?.unit).toBe("kg");
    expect(liquid.moles?.value.toNumber()).toBeCloseTo(0.2773);
    expect(liquid.moles?.unit).toBe("kmol");
    expect(liquid.volume?.value.toNumber()).toBeCloseTo(22.5326);
    expect(liquid.volume?.unit).toBe("l");
  });

  it("creates a liquid reagent from a volume value", () => {
    const liquid = factory.create(liquidChemicalVol);
    expect(liquid).toBeInstanceOf(Liquid);
    expect(liquid.mass?.value.toNumber()).toBeCloseTo(266.28);
    expect(liquid.mass?.unit).toBe("g");
    expect(liquid.moles?.value.toNumber()).toBeCloseTo(3.692);
    expect(liquid.moles?.unit).toBe("mol");
    expect(liquid.volume?.value.toNumber()).toBeCloseTo(300);
    expect(liquid.volume?.unit).toBe("ml");
  });

  it("creates a liquid reagent from a moles value", () => {
    const liquid = factory.create(liquidChemicalMoles);
    expect(liquid).toBeInstanceOf(Liquid);
    expect(liquid.mass?.value.toNumber()).toBeCloseTo(721.1);
    expect(liquid.mass?.unit).toBe("g");
    expect(liquid.moles?.value.toNumber()).toBeCloseTo(10);
    expect(liquid.moles?.unit).toBe("mol");
    expect(liquid.volume?.value.toNumber()).toBeCloseTo(812.415);
    expect(liquid.volume?.unit).toBe("ml");
  });

  it("creates a gaseous reagent", () => {
    const gas = factory.create(gasChemical);
    expect(gas).toBeInstanceOf(Gas);
    expect(gas.pressure?.value.toNumber()).toBeCloseTo(300);
    expect(gas.pressure?.unit).toBe("atm");
    expect(gas.mass?.value.toNumber()).toBeCloseTo(224.646);
    expect(gas.mass?.unit).toBe("g");
    expect(gas.moles?.value.toNumber()).toBeCloseTo(5.104);
    expect(gas.moles?.unit).toBe("mol");
    expect(gas.volume?.value.toNumber()).toBeCloseTo(0.5);
    expect(gas.volume?.unit).toBe("l");
  });

  it("throws an error for gaseous reagent missing temperature or volume", () => {
    expect(() => factory.create(gasChemicalNoTemp)).toThrow();
    expect(() => factory.create(gasChemicalNoVol)).toThrow();
  });

  it("throws an error for liquid reagent missing density", () => {
    expect(() => factory.create(liquidChemicalNoDensity)).toThrow();
  });
});

describe("Test computations for chemicals", () => {
  it("calculates the ratio (equivalents)", () => {
    const chem = factory.create(solidChemicalMass);
    chem.computeRatio(Big("0.00818"));
    expect(chem.ratio).toBeTruthy();
    const ratio = chem.ratio ? chem.ratio.toNumber() : null;
    expect(ratio).toBeCloseTo(0.1);
  });

  it("calculates the molarity of the chemical", () => {
    const totalSolventVolume = {
      unit: "l",
      value: Big("9.00e-3"),
      uncertainty: null,
    };
    const chemical = factory.create(solidChemicalMass);
    chemical.computeConcentration(totalSolventVolume, "molarity");
    expect(chemical.molarity).toBeTruthy();
    const molarityUnit = chemical.molarity ? chemical.molarity.unit : null;
    const molarityValue = chemical.molarity
      ? chemical.molarity.value.toNumber()
      : null;
    expect(molarityUnit).toBe(UNITS.MOL_L);
    expect(molarityValue).toBeCloseTo(0.09095);
  });

  it("calculates the molality of the chemical", () => {
    const totalSolventMass = {
      unit: "kg",
      value: Big("8.001e-3"),
      uncertainty: null,
    };
    const chemical = factory.create(solidChemicalMass);
    chemical.computeConcentration(totalSolventMass, "molality");
    expect(chemical.molality).toBeTruthy();
    const molalityUnit = chemical.molality ? chemical.molality.unit : null;
    const molalityValue = chemical.molality
      ? chemical.molality.value.toNumber()
      : null;
    expect(molalityUnit).toBe(UNITS.MOL_KG);
    expect(molalityValue).toBeCloseTo(0.1);
  });

  it("Calculates the moles per unit volume of the chemical", () => {
    const totalReactionVolume = {
      unit: "l",
      value: Big("9.00e-3"),
      uncertainty: null,
    };
    const chemical = factory.create(solidChemicalMass);
    chemical.computeConcentration(totalReactionVolume, "moles_vol");
    expect(chemical.moles_vol).toBeTruthy();
    const moles_volUnit = chemical.moles_vol ? chemical.moles_vol.unit : null;
    const moles_volValue = chemical.moles_vol
      ? chemical.moles_vol.value.toNumber()
      : null;
    expect(moles_volUnit).toBe(UNITS.MOL_L);
    expect(moles_volValue).toBeCloseTo(0.09095);
  });

  it("calculates moles from molarity", () => {
    const newVolume = { unit: "ml", value: Big("10"), uncertainty: null };
    const totalSolventVolume = {
      unit: "l",
      value: Big("9.00e-3"),
      uncertainty: null,
    };
    const chemical = factory.create(solidChemicalMass);
    chemical.computeConcentration(totalSolventVolume, "molarity");
    const molesOutput = chemical.getMolesByVolume(newVolume);
    expect(molesOutput.quantity.unit).toBe(UNITS.MMOL);
    expect(molesOutput.quantity.value.toNumber()).toBeCloseTo(0.9095);
  });

  it("exports a chemical config", () => {
    const chemical = factory.create(solidChemicalMass);
    const outputConfig = chemical.export();

    expect(outputConfig.quantity.unit).toBe(UNITS.MMOL);
    expect(outputConfig.quantity.value.toNumber()).toBeCloseTo(0.8185);
  });

  it("returns the correct values", () => {
    const totalSolventVolume = {
      unit: "l",
      value: Big("9.00e-3"),
      uncertainty: null,
    };
    const totalSolventMass = {
      unit: "kg",
      value: Big("8.001e-3"),
      uncertainty: null,
    };
    const totalReactionVolume = {
      unit: "l",
      value: Big("9.00e-3"),
      uncertainty: null,
    };
    const chem = factory.create(solidChemicalMass);
    chem.computeRatio(Big("0.00818"));
    chem.computeConcentration(totalReactionVolume, "moles_vol");
    chem.computeConcentration(totalSolventMass, "molality");
    chem.computeConcentration(totalSolventVolume, "molarity");
    const values = chem.getValues();
    expect(values).toEqual({
      name: "p-methylbenzyl alcohol",
      mass: { value: 100, unit: "mg", uncertainty: null },
      volume: null,
      moles: { value: 0.8186, unit: "mmol", uncertainty: null },
      pressure: null,
      ratio: 0.1,
      roles: [TAGS.INITIATOR],
      mw: 122.16,
      density: null,
      molarity: { unit: "mol/l", value: 0.091, uncertainty: null },
      molality: { unit: "mol/kg", value: 0.1023, uncertainty: null },
      moles_vol: { unit: "mol/l", value: 0.091, uncertainty: null },
      limiting: true,
    });
  });
});
