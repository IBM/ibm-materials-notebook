import Big from "big.js";
import { CMDLUnit, Quantity } from "../../symbol-types";
import { Reactor } from "../reactor-group";
import { ReactorComponent } from "../reactor-component";
import { testChemicals } from "./reactor-chem.test";
import { ChemPropKey } from "../../chemicals/base-chemical";
import { ChemStates } from "../../chemicals/chemical-factory";
import { ChemicalConfig } from "../../chemicals/chemical-factory";
import { ReactorChemicals } from "../reactor-chemicals";

const kOtbu: ChemicalConfig = {
  name: "l-lactide",
  mw: Big(144.12),
  density: null,
  state: ChemStates.SOLID,
  quantity: {
    name: ChemPropKey.MASS,
    value: Big("1441.2"),
    unit: "mg",
    uncertainty: null,
  },
  roles: ["catalyst"],
  limiting: true,
};

const monomerSolvent: ChemicalConfig = {
  name: "THF",
  mw: Big(72.11),
  density: Big(0.8876),
  state: ChemStates.LIQUID,
  quantity: {
    name: ChemPropKey.VOLUME,
    value: Big("10"),
    unit: "ml",
    uncertainty: null,
  },
  roles: ["solvent"],
  limiting: false,
};

export const monomerSolution = [kOtbu, monomerSolvent];

const REACTOR_A = "reactor_a";
const NODE_A = "node_a";
const NODE_B = "node_b";
const NODE_C = "node_c";
const NODE_D = "node_d";
const NODE_E = "node_e";

const nodeVolume: CMDLUnit = {
  uncertainty: null,
  unit: "mcl",
  value: "500",
};

export const flowRate: Quantity = {
  unit: "ml/min",
  value: Big(10),
  uncertainty: null,
};

describe("Tests for reactor", () => {
  it("initializes correctly", () => {
    const reactor = new Reactor(REACTOR_A);
    expect(reactor.name).toBe(REACTOR_A);
  });

  it("can add nodes", () => {
    const reactor = new Reactor(REACTOR_A);
    const nodeA = new ReactorComponent(NODE_A);
    reactor.add(nodeA);

    expect(reactor.children.length).toBe(1);
    expect(reactor.children[0].parent).toEqual(reactor);
  });

  it("can compute total volume", () => {
    const reactor = new Reactor(REACTOR_A);

    const nodeA = new ReactorComponent(NODE_A);
    nodeA.setVolume(nodeVolume);
    const nodeB = new ReactorComponent(NODE_B);
    nodeB.setVolume(nodeVolume);
    const nodeC = new ReactorComponent(NODE_C);
    nodeC.setVolume(nodeVolume);

    reactor.add(nodeA);
    reactor.add(nodeB);
    reactor.add(nodeC);

    reactor.computeVolume();

    expect(reactor.volume).toBeTruthy();
    expect(reactor.volume?.value.toNumber()).toBeCloseTo(1.5);
    expect(reactor.volume?.unit).toBe("ml");
  });

  it("can set the output node", () => {
    const reactor = new Reactor(REACTOR_A);

    const nodeA = new ReactorComponent(NODE_A);
    const nodeB = new ReactorComponent(NODE_B);
    const nodeC = new ReactorComponent(NODE_C);
    nodeA.setNext(nodeB);
    nodeB.setNext(nodeC);

    reactor.add(nodeA);
    reactor.add(nodeB);
    reactor.add(nodeC);

    reactor.setOutputNode();

    expect(reactor.outputNode).toBeTruthy();
    expect(reactor.outputNode?.name).toBe(NODE_C);
  });

  it("throws while getting inputs when no output node", () => {
    const reactor = new Reactor(REACTOR_A);
    expect(() => reactor.getInputs()).toThrow();
  });

  it("throws while getting inputs when no volume", () => {
    const reactor = new Reactor(REACTOR_A);

    const nodeA = new ReactorComponent(NODE_A);
    const nodeB = new ReactorComponent(NODE_B);
    const nodeC = new ReactorComponent(NODE_C);
    nodeA.setNext(nodeB);
    nodeB.setNext(nodeC);

    reactor.add(nodeA);
    reactor.add(nodeB);
    reactor.add(nodeC);

    reactor.setOutputNode();
    expect(() => reactor.getInputs()).toThrow();
  });

  it("can get generate outputs", () => {
    const reactor = new Reactor(REACTOR_A);

    const inputA = new ReactorChemicals(flowRate);
    const inputB = new ReactorChemicals(flowRate);
    inputA.setChemicals(testChemicals);
    inputA.computeInitialValues();
    inputB.setChemicals(monomerSolution);
    inputB.computeInitialValues();

    const nodeA = new ReactorComponent(NODE_A);
    const nodeB = new ReactorComponent(NODE_B);
    const nodeC = new ReactorComponent(NODE_C);
    const nodeD = new ReactorComponent(NODE_D);
    const nodeE = new ReactorComponent(NODE_E);

    nodeC.setVolume(nodeVolume);
    nodeD.setVolume(nodeVolume);
    nodeE.setVolume(nodeVolume);

    nodeA.setInput(inputA);
    nodeB.setInput(inputB);
    nodeA.setNext(nodeC);
    nodeB.setNext(nodeC);

    nodeC.setNext(nodeD);
    nodeC.addSource(nodeA);
    nodeC.addSource(nodeB);

    nodeD.setNext(nodeE);
    nodeD.addSource(nodeC);

    nodeE.addSource(nodeD);

    reactor.add(nodeA);
    reactor.add(nodeB);
    reactor.add(nodeC);
    reactor.add(nodeD);
    reactor.add(nodeE);

    reactor.setOutputNode();
    reactor.computeVolume();
    reactor.getInputs();
    const outputs = reactor.getOutput();

    expect(outputs).toBeTruthy();
    expect(outputs.reactants.length).toBe(4);
    expect(outputs.volume.value).toBe("1.5");
    expect(outputs.volume.unit).toBe("ml");
    expect(outputs.residenceTime.value).toBe("4.5");
    expect(outputs.volume.unit).toBe("ml");
  });
});
