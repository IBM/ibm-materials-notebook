import { cmdlLogger as logger } from "../../logger";
import { PolymerTree } from "./polymer-tree";
import { PolymerComponent } from "./polymer-types";
import { Container } from "./polymer-tree-container";
import { PolymerNode } from "./polymer-node";
import { PolymerEdge } from "./polymer-edge";
import { JSONPolymerGraph } from "./polymer-container";

/**
 * Class for handling polymer graph representation
 */
export class PolymerGraph {
  /**
   * Map of node id (node path) and polymer edges originating from the node
   */
  adjacencyList = new Map<string, PolymerEdge[]>();
  /**
   * Map of node id (node path) and polymer nodes in the graph
   */
  nodes = new Map<string, PolymerNode>();
  /**
   * Array of polymer edges, used temporarily for building adjacencyList
   * @todo remove need for this property in function
   */
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
  public getNodeKeys(): string[] {
    return [...this.nodes.keys()];
  }

  /**
   * Sets a property such as degree of polymerization to a particular
   * node in the polymer graph
   * @param nodePath string
   * @param property any
   */
  public setNodeProperty(nodePath: string, property: any): void {
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
  public expand(): void {
    //create a new graph
    //add additional nodes/edges for quantities > 1
    throw new Error(`Expand method is not implemented`);
  }

  /**
   * Serializes graph to Object
   * @returns Object
   */
  public toJSON(): JSONPolymerGraph {
    const nodes = [...this.nodes.values()].map((el) => el.toJSON());
    const edges = this.edges.map((el) => el.toJSON());
    return { nodes, edges };
  }

  /**
   * Serializes graph to string representation
   * @returns string
   */
  public toString(): string {
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
  public toMaskedString(): string {
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
  public toCompressedString() {
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
