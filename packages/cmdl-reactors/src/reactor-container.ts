import { Reactor } from "./reactor-group";
import { ReactorChemicals } from "./reactor-chemicals";
import { ReactorComponent } from "./reactor-component";
import { logger } from "./logger";
import { TYPES } from "cmdl-types";

export interface ReactorEdge {
  id: string;
  target: string | null;
}

export interface ReactorGroupOutput {
  name: string;
  flowRate: TYPES.NumericQty;
  residenceTime: TYPES.NumericQty;
  volume: TYPES.NumericQty;
  reactants: TYPES.ChemicalOutput[];
}

/**
 * Top-level class for representing a continuous-flow reactor graph
 */
export class ReactorContainer {
  outputNode: ReactorComponent | null = null;
  reactorMap = new Map<string, Reactor>();
  nodeMap = new Map<string, ReactorComponent>();
  edgeMap = new Map<string, ReactorEdge>();
  reactorLinks = new Map<string, string>();

  /**
   * Parses and creates a new reactor from a CMDL representation
   * @param component CMDLReactor
   */
  public addReactor(component: TYPES.Reactor): void {
    logger.debug(`reactor:`, { meta: component });
    const reactor = new Reactor(component.name);
    reactor.parent = null;

    if (!component?.components) {
      throw new Error(
        `reactor ${component.name} does not define any components`
      );
    }

    for (const item of component.components) {
      const node = this.addNode(item);
      reactor.add(node);
    }

    this.reactorMap.set(component.name, reactor);
  }

  /**
   * Creates a new ReactorComponent as a node in the reactor graph
   * @param component CMDLReactorNode
   * @returns ReactorComponent
   */
  public addNode(component: TYPES.ReactorNode): ReactorComponent {
    const node = new ReactorComponent(component.name);
    let target = component?.target;
    let volume = component?.volume;

    node.length = component?.length;
    node.inner_diameter = component?.inner_diameter;
    node.outer_diameter = component?.outer_diameter;
    node.description = component?.description;

    let targetName = null;

    if (target && target?.path) {
      targetName = target.path.length
        ? target.path[target.path.length - 1]
        : target.ref;
    }

    if (volume) {
      node.setVolume(volume);
    }

    const edge = { id: node.name, target: targetName };
    this.edgeMap.set(edge.id, edge);
    this.nodeMap.set(node.name, node);
    return node;
  }

  /**
   * Creates connections between nodes in the reactor graph
   */
  public linkNodeGraph(): void {
    for (const edge of this.edgeMap.values()) {
      let sourceNode = this.nodeMap.get(edge.id);

      if (!sourceNode) {
        throw new Error(`reactor node ${edge.id} is missing`);
      }

      if (!edge.target) {
        if (!this.outputNode) {
          this.outputNode = sourceNode;
          continue;
        } else {
          throw new Error(
            `output node ${this.outputNode.name} is already defined: ${sourceNode.name}`
          );
        }
      }

      let targetNode = this.nodeMap.get(edge.target);

      if (!targetNode) {
        throw new Error(`reactor node ${targetNode} is missing`);
      }

      sourceNode.setNext(targetNode);
      targetNode.addSource(sourceNode);
    }
  }

  /**
   * Sets chemicals from a stock-solution as an input to a reactor component
   * @param nodeId string
   * @param input ReactorChemicals
   */
  public setNodeInput(nodeId: string, input: ReactorChemicals): void {
    const node = this.nodeMap.get(nodeId);

    if (!node) {
      throw new Error(`component ${nodeId} does not exist!`);
    }

    node.setInput(input);
  }

  /**
   * Compiles output of each reactor group within a reactor graph
   * @returns
   */
  public getOutputs(): ReactorGroupOutput[] {
    const outputs: ReactorGroupOutput[] = [];

    for (const reactor of this.reactorMap.values()) {
      let reactorOutput = reactor.getOutput();
      outputs.push(reactorOutput);
    }
    return outputs;
  }

  /**
   * Processes all reactor groups and computes stoichiometry for reactions
   */
  public processReactor(): void {
    if (!this.outputNode) {
      throw new Error(`Output node is not set for reactor container`);
    }

    for (const reactor of this.reactorMap.values()) {
      reactor.setOutputNode();
      reactor.computeVolume();
    }

    this.outputNode.getInputs();
  }
}
