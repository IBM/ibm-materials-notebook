import { ReactorChemicals } from "../reactor-chemicals";
import { ReactorComponent } from "../reactor-component";
import { flowRate } from "./reactor-chem.test";
import { TYPES } from "@ibm-materials/cmdl-types";
import Big from "big.js";

const NODE_A = "node_a";
const NODE_B = "node_b";
const NODE_C = "node_c";

const nodeVolume: TYPES.BigQty = {
  uncertainty: null,
  unit: "mcl",
  value: Big(500),
};

describe("Tests for reactor component", () => {
  it("initializes correctly", () => {
    const component = new ReactorComponent(NODE_A);
    expect(component.name).toBe(NODE_A);
  });

  it("can normalize a volume", () => {
    const component = new ReactorComponent(NODE_A);
    component.setVolume(nodeVolume);
    expect(component.volume).toBeTruthy();
    expect(component.volume?.unit).toBe("ml");
    expect(component.volume?.value.toNumber()).toBeCloseTo(0.5);
  });

  it("throws an error with no input or source", () => {
    const component = new ReactorComponent(NODE_A);
    expect(() => component.getInputs()).toThrow();
  });

  it("throws when input and sources are set", () => {
    const component = new ReactorComponent(NODE_A);
    const source = new ReactorComponent(NODE_B);
    const input = new ReactorChemicals(flowRate);
    component.addSource(source);
    component.setInput(input);
    expect(() => component.getInputs()).toThrow();
  });

  it("returns the input if the input is set", () => {
    const component = new ReactorComponent(NODE_A);
    const input = new ReactorChemicals(flowRate);
    component.setInput(input);
    const nodeOutput = component.getInputs();
    expect(nodeOutput.length).toBe(1);
    expect(nodeOutput[0]).toEqual(input);
  });

  it("returns the source input if when having sources", () => {
    const component = new ReactorComponent(NODE_A);
    const sourceB = new ReactorComponent(NODE_B);
    const chemB = new ReactorChemicals(flowRate);
    const sourceC = new ReactorComponent(NODE_C);
    const chemC = new ReactorChemicals(flowRate);

    sourceB.setInput(chemB);
    sourceC.setInput(chemC);
    component.addSource(sourceB);
    component.addSource(sourceC);

    const nodeOutputs = component.getInputs();
    expect(nodeOutputs.length).toBe(2);
    expect(nodeOutputs[0]).toBeInstanceOf(ReactorChemicals);
    expect(nodeOutputs[1]).toBeInstanceOf(ReactorChemicals);
  });
});
