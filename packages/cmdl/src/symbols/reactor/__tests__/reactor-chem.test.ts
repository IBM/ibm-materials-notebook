import Big from "big.js";
import { Quantity } from "../../symbol-types";
import { ReactorChemicals } from "../reactor-chemicals";
import { ChemStates } from "../../chemicals/chemical-factory";
import { ChemicalConfig } from "../../chemicals/chemical-factory";
import { PROPERTIES, TAGS } from "../../../cmdl-types";

export const flowRate: Quantity = {
  unit: "ml/min",
  value: Big(10),
  uncertainty: null,
};

const totalFlowRate: Quantity = {
  unit: "ml/min",
  value: Big(20),
  uncertainty: null,
};

const reactorVolume: Quantity = {
  unit: "ml",
  value: Big(1),
  uncertainty: null,
};

const pMeBnOH: ChemicalConfig = {
  name: "p-methylbenzyl alcohol",
  mw: Big(122.16),
  density: null,
  state: ChemStates.SOLID,
  quantity: {
    name: PROPERTIES.MASS,
    value: Big("488"),
    unit: "mg",
    uncertainty: null,
  },
  roles: [TAGS.INITIATOR],
  limiting: true,
};

const kOtbu: ChemicalConfig = {
  name: "potassium tert-butoxide",
  mw: Big(112.212),
  density: null,
  state: ChemStates.SOLID,
  quantity: {
    name: PROPERTIES.MASS,
    value: Big("112"),
    unit: "mg",
    uncertainty: null,
  },
  roles: [TAGS.CATALYST],
  limiting: false,
};

const solvent: ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: ChemStates.LIQUID,
  quantity: {
    name: PROPERTIES.VOLUME,
    value: Big("10"),
    unit: "ml",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
};

export const testChemicals = [pMeBnOH, kOtbu, solvent];

describe("Tests for reactor chemicals", () => {
  it("initializes correctly", () => {
    const flowChem = new ReactorChemicals(flowRate);
    expect(flowChem.flowRate).toEqual(flowRate);
  });

  it("can add a chemicals", () => {
    const flowChem = new ReactorChemicals(flowRate);
    expect(() => flowChem.setChemicals(testChemicals)).not.toThrow();
  });

  it("can compute chemical values", () => {
    const flowChem = new ReactorChemicals(flowRate);
    flowChem.setChemicals(testChemicals);
    const computedValues = flowChem.computeValues();

    expect(computedValues.length).toBe(3);
    expect(computedValues[0].moles.value).toBeCloseTo(3.99);
    expect(computedValues[1].moles.value).toBeCloseTo(0.998);
    expect(computedValues[2].moles.value).toBeCloseTo(0.1231);
  });

  it("can get chemicals by volume", () => {
    const flowChem = new ReactorChemicals(flowRate);
    flowChem.setChemicals(testChemicals);
    flowChem.computeInitialValues();
    const volumeOutput = flowChem.getByVolume(totalFlowRate, reactorVolume);

    expect(volumeOutput.length).toBe(3);
    expect(volumeOutput[0].quantity.value.toNumber()).toBeCloseTo(0.1884);
    expect(volumeOutput[0].quantity.unit).toBe("mmol");
    expect(volumeOutput[1].quantity.value.toNumber()).toBeCloseTo(0.0471);
    expect(volumeOutput[1].quantity.unit).toBe("mmol");
    expect(volumeOutput[2].quantity.value.toNumber()).toBeCloseTo(5.805);
    expect(volumeOutput[2].quantity.unit).toBe("mmol");
  });
});
