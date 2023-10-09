import { PolymerGraph } from "./graph";
import { PolymerTree } from "./tree";
import { PolymerWeight } from "./weights";
import { PolymerNode } from "./node";
import { Container } from "./tree-container";
import { TYPES } from "@ibm-materials/cmdl-types";

/**
 * Top level class for managing polymer tree and graph representations
 */
export class PolymerContainer {
  name: string;
  tree = new PolymerTree();
  graph = new PolymerGraph();

  constructor(name: string) {
    this.name = name;
  }

  public insertContainer(container: Container, parent?: string): void {
    this.tree.insert(container, parent);
  }

  public createPolymerContainer(name: string): Container {
    return new Container(name);
  }

  public createPolymerNode(fragment: string, smiles: string): PolymerNode {
    return new PolymerNode(fragment, smiles);
  }

  public createPolymerEdges(
    conn: TYPES.PolymerConnection,
    container: Container
  ): void {
    this.tree.createEdges(conn, container);
  }

  /**
   * Constructs a polymer composite tree data structure
   */
  build(): void {
    this.tree.root?.setName();
    this.tree.root?.setPath();
    this.tree.root?.updateConnectionPaths();
    this.buildGraph();
  }

  /**
   * Computes weights for each edge within the polymer graph depending
   * on the degree polymerization for connected nodes.
   * 1. Determines whether polymer is cyclic or linear
   * 2. Scores polymer
   * 3. Finalizes polymer edge weights
   */
  public computePolymerWeights(): void {
    const weightor = new PolymerWeight(this.graph);
    weightor.selectStrategy(this.tree);
    weightor.scorePolymer(this.tree);
    weightor.weightPolymer(this.tree);
  }

  /**
   * Method to convert polymer composite tree into a graph
   */
  private buildGraph(): void {
    this.graph.initialize(this.tree);
  }

  /**
   * Method to convert polymer graph to a string
   * @returns string
   */
  public graphToString(): string {
    return this.graph.toString();
  }

  /**
   * Compiles a SMILES string for the polymer where each node
   * element is separated by a "." character in the string
   * @returns string
   */
  public getSmilesStr(): string {
    return this.tree.compileSmiles();
  }

  /**
   * Embeds degree of polymerization values within their respective nodes
   * in the polymer graph
   * @param values CMDLPolymerTreeValue[] | RefResult[]
   */
  public addGraphValues(values: TYPES.PolymerTreeValue[]) {
    const baseName = this.tree.getBaseName();
    for (const prop of values) {
      let path = `${baseName}.${prop.path.join(".")}`;

      if ("degree_poly" in prop) {
        this.graph.setNodeProperty(path, {
          name: "degree_poly",
          value: prop.degree_poly,
        });
      } else {
        throw new Error(`Property is not embeddable`);
      }
    }
  }

  public clone(): PolymerContainer {
    const polymer = new PolymerContainer(this.name);
    const tree = this.tree.clone();
    polymer.tree = tree;
    polymer.graph.initialize(tree);
    return polymer;
  }
}
