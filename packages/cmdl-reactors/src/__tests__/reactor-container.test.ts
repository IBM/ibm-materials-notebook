import { ReactorContainer } from "../reactor-container";
import { ReactorChemicals } from "../reactor-chemicals";
import { flowRate, monomerSolution } from "./reactor-group.test";
import { testChemicals } from "./reactor-chem.test";

// const serializedReactor: SerializedReactor = {
//   nodes: [
//     {
//       name: "MonomerTank",
//       type: "component",
//       sources: [],
//       next: "Mixer",
//       parent: null,
//     },
//     {
//       name: "CatalystTank",
//       type: "component",
//       sources: [],
//       next: "Mixer",
//       parent: null,
//     },
//     {
//       name: "Mixer",
//       type: "component",
//       sources: ["MonomerTank", "CatalystTank"],
//       next: "ReactorTube",
//       parent: "PolyReactor",
//     },
//     {
//       name: "ReactorTube",
//       type: "component",
//       sources: ["Mixer"],
//       next: "Collection",
//       volume: {
//         unit: "ml",
//         value: 2,
//         uncertainty: null,
//       },
//       parent: "PolyReactor",
//     },
//     {
//       name: "Collection",
//       type: "component",
//       sources: ["ReactorTube"],
//       next: null,
//       parent: null,
//     },
//   ],
//   edges: [
//     {
//       id: "MonomerTank",
//       target: "Mixer",
//     },
//     {
//       id: "CatalystTank",
//       target: "Mixer",
//     },
//     {
//       id: "Mixer",
//       target: "ReactorTube",
//     },
//     {
//       id: "ReactorTube",
//       target: "Collection",
//     },
//     {
//       id: "Collection",
//       target: null,
//     },
//   ],
//   outputNode: "Collection",
//   reactors: [
//     {
//       name: "PolyReactor",
//       type: "reactor",
//       parent: null,
//       children: ["Mixer", "ReactorTube"],
//     },
//   ],
// };

describe("Tests for reactor container", () => {
  it.skip("deserializes a reactor", () => {
    const container = new ReactorContainer();
    // container.deserialize(serializedReactor);
    expect(container.nodeMap.size).toBe(5);
    expect(container.reactorMap.size).toBe(1);
    expect(container.edgeMap.size).toBe(5);
  });

  it.skip("adds inputs to nodes", () => {
    const container = new ReactorContainer();
    // container.deserialize(serializedReactor);

    const inputA = new ReactorChemicals(flowRate);
    const inputB = new ReactorChemicals(flowRate);
    inputA.setChemicals(testChemicals);
    inputA.computeInitialValues();
    inputB.setChemicals(monomerSolution);
    inputB.computeInitialValues();

    container.setNodeInput("MonomerTank", inputA);
    container.setNodeInput("CatalystTank", inputB);

    const monomerTank = container.nodeMap.get("MonomerTank");
    const catalystTank = container.nodeMap.get("CatalystTank");

    expect(monomerTank?.input).toBeTruthy();
    expect(catalystTank?.input).toBeTruthy();
  });

  it.skip("processes inputs", () => {
    const container = new ReactorContainer();
    // container.deserialize(serializedReactor);

    const inputA = new ReactorChemicals(flowRate);
    const inputB = new ReactorChemicals(flowRate);
    inputA.setChemicals(testChemicals);
    inputA.computeInitialValues();
    inputB.setChemicals(monomerSolution);
    inputB.computeInitialValues();

    container.setNodeInput("MonomerTank", inputA);
    container.setNodeInput("CatalystTank", inputB);

    container.processReactor();
    const outputs = container.getOutputs();

    expect(outputs).toBeTruthy();
  });
});
