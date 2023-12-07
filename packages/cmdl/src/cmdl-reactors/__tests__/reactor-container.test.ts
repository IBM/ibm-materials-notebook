import { ReactorContainer } from "../reactor-container";
import { ReactorChemicals } from "../reactor-chemicals";
import { flowRate, monomerSolution } from "./reactor-group.test";
import { testChemicals } from "./reactor-chem.test";
import { ReactorNode } from "../../cmdl-types/types";

const monomerTankComp: ReactorNode = {
  name: "MonomerTank",
  type: "component",
  description: "a tank full of monomer",
  target: { ref: "T_Mixer", path: [] },
};

const catalystTankComp: ReactorNode = {
  name: "CatalystTank",
  type: "component",
  description: "a tank full of catalyst",
  target: { ref: "T_Mixer", path: [] },
};

const tmixerNode: ReactorNode = {
  name: "T_Mixer",
  type: "component",
  description: "a t-mixer node",
};

describe("Tests for reactor container", () => {
  it("adds inputs to nodes", () => {
    const container = new ReactorContainer();
    container.addNode(monomerTankComp);
    container.addNode(catalystTankComp);
    container.addNode(tmixerNode);
    const inputA = new ReactorChemicals(testChemicals, flowRate);
    const inputB = new ReactorChemicals(monomerSolution, flowRate);
    inputA.computeInitialValues();
    inputB.computeInitialValues();

    container.setNodeInput("MonomerTank", inputA);
    container.setNodeInput("CatalystTank", inputB);

    const monomerTank = container.nodeMap.get("MonomerTank");
    const catalystTank = container.nodeMap.get("CatalystTank");

    expect(monomerTank?.input).toBeTruthy();
    expect(catalystTank?.input).toBeTruthy();
  });

  it("processes inputs", () => {
    const container = new ReactorContainer();
    container.addNode(monomerTankComp);
    container.addNode(catalystTankComp);
    container.addNode(tmixerNode);
    const inputA = new ReactorChemicals(testChemicals, flowRate);
    const inputB = new ReactorChemicals(monomerSolution, flowRate);
    inputA.computeInitialValues();
    inputB.computeInitialValues();

    container.setNodeInput("MonomerTank", inputA);
    container.setNodeInput("CatalystTank", inputB);

    container.linkNodeGraph();
    container.processReactor();
    const outputs = container.getOutputs();

    expect(outputs).toBeTruthy();
  });
});
