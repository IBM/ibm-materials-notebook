import { PolymerTree } from "./tree";
import { PolymerComponent } from "./types";
import { Container } from "./tree-container";
import { PolymerNode } from "./node";
import { PolymerEdge } from "./edge";
import { logger } from "./logger";

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
   * Initializes polymer graph from polymer tree. Traverses tree to extract nodes & edges.
   * @param tree PolymerTree
   * @returns void
   */
  public initialize(tree: PolymerTree): void {
    if (!tree || !tree.root) {
      logger.warn(`cannot initialize polymer graph from empty tree`);
      return;
    }

    const queue: PolymerComponent[] = [tree.root];
    let curr: PolymerComponent | undefined;
    let edges: PolymerEdge[] = [];

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (!this.isContainer(curr)) {
        this.nodes.set(curr.name, curr as PolymerNode);
        this.adjacencyList.set(curr.name, []);
      } else {
        edges = edges.concat(curr.connections);
        if (curr.children.length) {
          curr.children.forEach((el) => {
            queue.push(el);
          });
        }
      }
    }

    for (const edge of edges) {
      const list = this.adjacencyList.get(edge.sourceName);

      if (!list) {
        throw new Error(`node ${edge.sourceName} does not exist`);
      }

      list.push(edge);
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
    const node = this.nodes.get(nodePath);

    if (!node) {
      throw new Error(`invalid path for node, path: ${nodePath}`);
    }

    node.properties.set(property.name, property.value);
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
   * Serializes graph to string but, masks absolute paths for conciseness
   * @returns string
   */
  public toString() {
    let output = "";
    const queue = [...this.adjacencyList.keys()];
    let key: string | undefined;

    let groupNumber = 1;

    const maskMap = new Map<string, string>();

    for (const node of this.nodes.keys()) {
      const nodeMask = `[@${groupNumber}]`;
      maskMap.set(node, nodeMask);
      groupNumber++;
    }

    while (queue.length) {
      key = queue.shift();

      if (!key) {
        break;
      }

      const node = this.nodes.get(key);
      const adjList = this.adjacencyList.get(key);
      const nodeMask = maskMap.get(key);

      if (!node || !adjList || !nodeMask) {
        throw new Error(`unable to find data for node ${key}`);
      }

      let nodeString = `${node.toCompressedString(nodeMask)}`;

      for (const edge of adjList) {
        nodeString = `${nodeString};${edge.toCompressedString(maskMap)}`;
      }
      output = `${output}<${nodeString}>`;
    }
    return output;
  }
}
