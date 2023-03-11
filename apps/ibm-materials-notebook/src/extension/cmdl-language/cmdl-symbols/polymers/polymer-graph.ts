import { cmdlLogger as logger } from "../../logger";
import { PolymerTree } from "./polymer-tree";
import { PolymerComponent } from "./polymer-types";
import { Container } from "./polymer-tree-container";
import { PolymerNode } from "./polymer-node";
import { PolymerEdge } from "./polymer-edge";
import Big from "big.js";
import { JSONPolymerGraph } from "./polymer-container";

/**
 * Class for handling polymer graph representation
 */
export class PolymerGraph {
  adjacencyList = new Map<string, PolymerEdge[]>(); //node path is key
  nodes = new Map<string, PolymerNode>(); //node path is key
  edges: PolymerEdge[] = [];

  /**
   * Initializes polymer graph from polymer tree. Traverses tree to extract nodes & edges.
   * @param tree PolymerTree
   * @returns void
   */
  public initialize(tree: PolymerTree): void {
    if (!tree || !tree.root) {
      logger.warn(`cannot initialize polymer graph from empty tree`);
      return;
    }

    let queue: PolymerComponent[] = [tree.root];
    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (!this.isContainer(curr)) {
        this.nodes.set(curr.name, curr as PolymerNode);
        this.adjacencyList.set(curr.name, []);
      } else {
        this.edges = this.edges.concat(curr.connections);
        if (curr.children.length) {
          curr.children.forEach((el) => {
            queue.push(el);
          });
        }
      }
    }

    this.linkGraph();
  }

  /**
   * @deprecated
   * @param nodeArray any[]
   */
  public initializeFromStr(nodeArray: any[]) {
    for (const node of nodeArray) {
      const namePath = node.name.split(".");

      const newNode = new PolymerNode({
        fragment: namePath[namePath.length - 1],
        mw: Big(node.mw),
        smiles: node.smiles,
      });
      newNode.name = node.name;

      this.nodes.set(node.name, newNode);

      for (const [key, value] of Object.entries(node)) {
        if (key !== "name" && key !== "mw" && key !== "smiles") {
          newNode.properties.set(key, value);
        }
      }

      let nodeEdges = [];
      if (node?.edges?.length) {
        for (const edge of node.edges) {
          let newEdge = new PolymerEdge({
            targetPath: edge.target.split("."),
            sourcePath: [...namePath, edge.sourcePoint],
            weight: Number(edge.weight),
            quantity: Number(edge.quantity),
          });
          nodeEdges.push(newEdge);
        }
      }
      this.adjacencyList.set(node.name, nodeEdges);
    }
  }

  /**
   * Type predicate to determine whether or not a component is a container
   * @param arg PolymerComponent
   * @returns boolean
   */
  private isContainer(arg: PolymerComponent): arg is Container {
    return arg.isContainer();
  }

  /**
   * Gets all names of nodes in the polymer graph
   * @returns string[]
   */
  getNodeKeys(): string[] {
    return [...this.nodes.keys()];
  }

  /**
   * Sets a property such as degree of polymerization to a particular
   * node in the polymer graph
   * @param nodePath string
   * @param property any
   */
  setNodeProperty(nodePath: string, property: any): void {
    let node = this.nodes.get(nodePath);

    if (!node) {
      throw new Error(`invalid path for node, path: ${nodePath}`);
    }

    node.properties.set(property.name, property.value);
  }

  /**
   * Populates the adjacency list once the insertion of all edges and nodes is complete
   */
  private linkGraph(): void {
    for (const edge of this.edges) {
      let list = this.adjacencyList.get(edge.sourceName);

      if (!list) {
        throw new Error(`node ${edge.sourceName} does not exist`);
      }

      list.push(edge);
    }
  }

  /**
   * Expands the compressed graph version to full version taking into account
   * the quantity of edges
   */
  expand(): void {
    //create a new graph
    //add additional nodes/edges for quantities > 1
    throw new Error(`Expand method is not implemented`);
  }

  /**
   * Serializes graph to Object
   * @returns Object
   */
  toJSON(): JSONPolymerGraph {
    const nodes = [...this.nodes.values()].map((el) => el.toJSON());
    const edges = this.edges.map((el) => el.toJSON());
    return { nodes, edges };
  }

  /**
   * Serializes graph to string representation
   * @returns string
   */
  toString(): string {
    let output = "";
    let queue = [...this.adjacencyList.keys()];
    let key: string | undefined;

    while (queue.length) {
      key = queue.shift();

      if (!key) {
        break;
      }

      let node = this.nodes.get(key);
      let adjList = this.adjacencyList.get(key);

      if (!node || !adjList) {
        throw new Error(`unable to find data for node ${key}`);
      }

      let nodeString = `${node.toString()}`;

      for (const edge of adjList) {
        nodeString = `${nodeString}${edge.toString()}`;
      }
      output = `${output}${nodeString};`;
    }
    return output;
  }

  /**
   * Serializes graph to string but, masks absolute paths for conciseness
   * @TODO remove SMILES conflicting characters
   * @returns string
   */
  toMaskedString(): string {
    let output = "";
    let queue = [...this.adjacencyList.keys()];
    let key: string | undefined;

    const masks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    let maskIndex = 0;

    const maskMap = new Map<string, string>();

    for (const node of this.nodes.keys()) {
      const nodeMask = masks[maskIndex];
      maskMap.set(node, nodeMask);
      maskIndex++;
    }

    while (queue.length) {
      key = queue.shift();

      if (!key) {
        break;
      }

      let node = this.nodes.get(key);
      let adjList = this.adjacencyList.get(key);
      let nodeMask = maskMap.get(key);

      if (!node || !adjList || !nodeMask) {
        throw new Error(`unable to find data for node ${key}`);
      }

      let nodeString = `${node.toMaskedString(nodeMask)}`;

      for (const edge of adjList) {
        nodeString = `${nodeString}${edge.toMaskedString(maskMap)}`;
      }
      output = `${output}<${nodeString}>`;
    }
    return output;
  }

  /**
   * Serializes graph to string but, masks absolute paths for conciseness
   * @TODO remove SMILES conflicting characters
   * @returns string
   */
  toCompressedString() {
    let output = "";
    let queue = [...this.adjacencyList.keys()];
    let key: string | undefined;

    const masks = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    let maskIndex = 0;

    const maskMap = new Map<string, string>();

    for (const node of this.nodes.keys()) {
      const nodeMask = masks[maskIndex];
      maskMap.set(node, nodeMask);
      maskIndex++;
    }

    while (queue.length) {
      key = queue.shift();

      if (!key) {
        break;
      }

      let node = this.nodes.get(key);
      let adjList = this.adjacencyList.get(key);
      let nodeMask = maskMap.get(key);

      if (!node || !adjList || !nodeMask) {
        throw new Error(`unable to find data for node ${key}`);
      }

      let nodeString = `${node.toCompressedString(nodeMask)}`;

      for (const edge of adjList) {
        nodeString = `${nodeString}|${edge.toCompressedString(maskMap)}`;
      }
      output = `${output}<${nodeString}>`;
    }
    return output;
  }
}
