import { Reactor } from "./reactor-group";
import { ReactorChemicals } from "./reactor-chemicals";
import { ReactorComponent } from "./reactor-component";
import { cmdlLogger } from "../../logger";
import Big from "big.js";
import { CMDLRef, CMDLUnit } from "../symbol-types";

export interface ReactorEdge {
  id: string;
  target: string | null;
}

interface CMDLReactorNode {
  name: string;
  type: string;
  description?: string;
  inner_diameter?: CMDLUnit;
  outer_diameter?: CMDLUnit;
  volume?: CMDLUnit;
  length?: CMDLUnit;
  target: CMDLRef;
}

interface SerializedReactorComponent extends Omit<CMDLReactorNode, "target"> {
  sources: string[];
  next: string | null;
  parent: string | null;
}

interface SerializedReactorGroup {
  name: string;
  type: string;
  parent: string | null;
  children: string[];
}

interface CMDLReactor {
  name: string;
  type: string;
  nodes: CMDLReactorNode[];
}

export interface SerializedReactor {
  nodes: SerializedReactorComponent[];
  edges: ReactorEdge[];
  outputNode: string | null;
  reactors: SerializedReactorGroup[];
}

export class ReactorContainer {
  outputNode: ReactorComponent | null = null;
  reactorMap = new Map<string, Reactor>();
  nodeMap = new Map<string, ReactorComponent>();
  edgeMap = new Map<string, ReactorEdge>();
  reactorLinks = new Map<string, string>();

  public addReactor(component: CMDLReactor) {
    cmdlLogger.debug(`reactor:`, { meta: component });
    const reactor = new Reactor(component.name);
    reactor.parent = null;

    if (!component?.nodes) {
      throw new Error(`reactor ${component.name} does not define any nodes`);
    }

    for (const item of component.nodes) {
      const node = this.addNode(item);
      reactor.add(node);
    }

    this.reactorMap.set(component.name, reactor);
  }

  public addNode(component: CMDLReactorNode) {
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

  public linkNodeGraph() {
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

  public setNodeInput(nodeId: string, input: ReactorChemicals) {
    const node = this.nodeMap.get(nodeId);

    if (!node) {
      throw new Error(`component ${nodeId} does not exist!`);
    }

    node.setInput(input);
  }

  public getOutputs() {
    const outputs: any[] = [];

    for (const reactor of this.reactorMap.values()) {
      let reactorOutput = reactor.getOutput();
      outputs.push(reactorOutput);
    }
    return outputs;
  }

  public getReactorNodeTree() {
    const nodeTree: Record<string, any> = {};

    for (const node of this.nodeMap.values()) {
      if (!node.parent) {
        nodeTree[node.name] = {};
      } else {
        if (nodeTree[node.parent.name]) {
          nodeTree[node.parent.name][node.name] = {};
        } else {
          nodeTree[node.parent.name] = {};
          nodeTree[node.parent.name][node.name] = {};
        }
      }
    }

    return nodeTree;
  }

  public processReactor() {
    if (!this.outputNode) {
      throw new Error(`Output node is not set for reactor container`);
    }

    for (const reactor of this.reactorMap.values()) {
      reactor.setOutputNode();
      reactor.computeVolume();
    }

    this.outputNode.getInputs();
  }

  public serialize(): SerializedReactor {
    const edges = [...this.edgeMap.values()];
    const nodes = [...this.nodeMap.values()].map((el) => el.serialize());
    const outputNode = this.outputNode ? this.outputNode.name : null;
    const reactors = [...this.reactorMap.values()].map((el) => el.serialize());

    return {
      nodes,
      edges,
      outputNode,
      reactors,
    };
  }

  public deserialize(arg: SerializedReactor) {
    arg.edges.forEach((el: ReactorEdge) => {
      this.edgeMap.set(el.id, el);
    });

    for (const reactor of arg.reactors) {
      let newReactor = new Reactor(reactor.name);

      this.reactorMap.set(reactor.name, newReactor);
    }

    for (const node of arg.nodes) {
      let newNode = new ReactorComponent(node.name);

      if (node.volume) {
        newNode.setVolume(node.volume);
      }

      if (node.parent) {
        let parent = this.reactorMap.get(node.parent);

        if (!parent) {
          throw new Error(`reactor ${parent} is not set for node ${node.name}`);
        } else {
          parent.add(newNode);
        }
      }

      this.nodeMap.set(node.name, newNode);
    }

    this.linkNodeGraph();
  }
}
