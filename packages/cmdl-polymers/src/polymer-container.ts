import { PolymerGraph } from "./polymer-graph";
import { PolymerTree } from "./polymer-tree";
import { PolymerWeight } from "./polymer-weights";
import { ModelType, CMDL } from "cmdl-types";

export interface JSONPolymerGraph {
  nodes: JSONPolymerNode[];
  edges: JSONPolymerConnection[];
}

export interface JSONPolymerContainer {
  name: string;
  parent: string | null;
  connections: JSONPolymerConnection[];
  children: (JSONPolymerContainer | JSONPolymerNode)[];
}

export interface JSONPolymerConnection {
  source: string;
  target: string;
  weight: number;
  quantity: string;
}

export interface JSONPolymerNode {
  name: string;
  mw: number;
  smiles: string;
  parent: string | null;
  degree_poly?: string;
}

export interface JSONPolymerTree<T extends string | null> {
  name: string;
  connections: JSONPolymerConnection[];
  parent: T;
  children: (JSONPolymerTree<string> | JSONPolymerNode)[];
}

export interface JSONPolymerGraphStructure {
  name: string;
  type: ModelType.POLYMER_GRAPH;
  tree: JSONPolymerTree<null>;
}

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

  /**
   * Constructs a polymer composite tree data structure
   * @param treeConfig CMDLPolymerTree
   * @param record ModelActivationRecord
   * TODO: remove coupling with model activation record
   */
  // buildTree(treeConfig: CMDLPolymerTree, record: ModelActivationRecord) {
  //   this.tree.initialize(treeConfig, record);
  //   this.tree.root?.setName();
  //   this.tree.root?.setPath();
  //   this.tree.root?.updateConnectionPaths();
  // }

  /**
   * Initializes polymer tree data structure from imported JSON representation
   * @param tree JSONPolymerTree<null>
   */
  initializeTreeFromJSON(tree: JSONPolymerTree<null>): void {
    this.tree.fromJSON(tree);
    this.tree.root?.setName();
    this.tree.root?.setPath();
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
  public buildGraph(): void {
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
   * Method to convert polymer graph to an JSON object
   * @returns object
   */
  public graphToJSON(): JSONPolymerGraph {
    return this.graph.toJSON();
  }

  /**
   * Creates a node tree to enable embedding of
   * nodes within the symbol table
   * @returns CMDLNodeTree
   */
  public getGraphNodes(): CMDL.NodeTree {
    const keys = this.graph.getNodeKeys();

    const keyTree: CMDL.NodeTree = {};

    for (const key of keys) {
      let keyPath = key.split(".");
      traverseKeys(keyPath, keyTree);
    }

    function traverseKeys(path: string[], keyTree: CMDL.NodeTree): void {
      if (!path.length) {
        return;
      }

      if (keyTree[path[0]]) {
        return traverseKeys(path.slice(1), keyTree[path[0]]);
      } else {
        keyTree[path[0]] = {};
        return traverseKeys(path.slice(1), keyTree[path[0]]);
      }
    }

    return keyTree;
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
  public addGraphValues(values: CMDL.PolymerTreeValue[] | CMDL.RefResult[]) {
    const baseName = this.tree.getBaseName();
    for (const prop of values) {
      let path = `${baseName}.${prop.path.join(".")}`;

      if ("degree_poly" in prop) {
        this.graph.setNodeProperty(path, {
          name: "degree_poly",
          value: prop.degree_poly,
        });
      } else {
        this.graph.setNodeProperty(path, {
          name: "degree_poly",
          value: prop.value,
        });
      }
    }
  }

  /**
   * Method to convert polymer tree to an Object
   * @returns object
   */
  public treeToJSON() {
    return this.tree.toJSON();
  }

  /**
   * Method to convert polymer graph into BigSmiles
   * @TODO improve scope of BigSMILES conversion
   * @deprecated
   * @returns string
   */
  public treeToBigSmiles() {
    return this.tree.toBigSMILES();
  }
}
