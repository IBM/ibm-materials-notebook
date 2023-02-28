import { ModelActivationRecord } from "../models";
import { PolymerGraph } from "./polymer-graph";
import { PolymerTree } from "./polymer-tree";
import { PolymerWeight } from "./polymer-weights";
import { CMDLPolymerTree } from "./polymer-types";

export class PolymerContainer {
  name: string;
  tree = new PolymerTree();
  graph = new PolymerGraph();

  constructor(name: string) {
    this.name = name;
  }

  buildTree(treeConfig: CMDLPolymerTree, record: ModelActivationRecord) {
    this.tree.initialize(treeConfig, record);
    this.tree.root?.setName();
    this.tree.root?.setPath();
    this.tree.root?.updateConnectionPaths();
    // this.computePolymerWeights();
  }

  initializeTreeFromJSON(tree: any) {
    this.tree.fromJSON(tree);
    this.tree.root?.setName();
    this.tree.root?.setPath();
    this.buildGraph();
  }

  computePolymerWeights() {
    const weightor = new PolymerWeight(this.graph);
    weightor.selectStrategy(this.tree);
    weightor.scorePolymer(this.tree);
    weightor.weightPolymer(this.tree);
  }

  /**
   * Method to convert polymer composite tree into a graph
   */
  buildGraph() {
    this.graph.initialize(this.tree);
  }

  serialize() {
    const graph = this.graph.toJSON();
    return { graph };
  }

  /**
   * @deprecated
   * @param graphStr string
   */
  deserialize(graphStr: string) {
    try {
      const graphArray = graphStr.split(";").filter((el) => el.length);
      const propArrays = graphArray.map((el) => el.split("<"));

      let nodeArray = [];
      for (const node of propArrays) {
        let nodeRecord: Record<string, any> = {
          edges: [],
        };

        for (const item of node) {
          if (!item.length) {
            continue;
          }

          const propTuple = item.split(">");

          if (
            propTuple[0] === "name" ||
            propTuple[0] === "mw" ||
            propTuple[0] === "smiles"
          ) {
            nodeRecord[propTuple[0]] = propTuple[1];
            continue;
          }

          if (propTuple[0] === "edge") {
            let targetTuple = propTuple[2].split("|");
            let edgeRecord = {
              sourcePoint: propTuple[1].replace(/ -/, ""),
              target: targetTuple[0].trim(),
              weight: targetTuple[1],
              quantity: targetTuple[2],
            };
            nodeRecord.edges.push(edgeRecord);
          }
        }
        nodeArray.push(nodeRecord);
      }

      this.graph.initializeFromStr(nodeArray);
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Method to convert polymer graph to a string
   * @returns string
   */
  graphToString() {
    return this.graph.toString();
  }

  /**
   * Method to convert polymer graph to a masked string
   * @returns string
   */
  graphToMaskedString() {
    return this.graph.toMaskedString();
  }

  /**
   * Method to convert polymer graph to a masked string
   * @returns string
   */
  graphToCompressedString() {
    return this.graph.toCompressedString();
  }

  /**
   * Method to convert polymer graph to an Object
   * @returns object
   */
  graphToJSON() {
    return this.graph.toJSON();
  }

  getGraphNodes() {
    const keys = this.graph.getNodeKeys();

    const keyTree: Record<string, any> = {};

    for (const key of keys) {
      let keyPath = key.split(".");
      traverseKeys(keyPath, keyTree);
    }

    function traverseKeys(path: string[], keyTree: Record<string, any>): void {
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

  getSmilesStr() {
    return this.tree.compileSmiles();
  }

  addGraphValues(values: any[]) {
    const baseName = this.tree.getBaseName();
    for (const prop of values) {
      let path = `${baseName}.${prop.path.join(".")}`;
      this.graph.setNodeProperty(path, {
        name: "degree_poly",
        value: prop?.degree_poly ? prop.degree_poly : prop.value,
      });
    }
  }

  /**
   * Method to convert polymer tree to an Object
   * @returns object
   */
  treeToJSON() {
    return this.tree.toJSON();
  }
}
