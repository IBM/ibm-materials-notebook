import { PolymerTree } from "./tree";
import { PolymerEdge } from "./edge";
import { PolymerNode } from "./node";
import { PolymerGraph } from "./graph";
import { PolymerStrategy } from "./strategies";
import {
  SideChainVisitor,
  StrategyVisitor,
  EdgeMultiplier,
  EdgeWeightor,
} from "./polymer-visitors";

/**
 * Class for managing computation of polymer weights
 */
export class PolymerWeight {
  totalScore: number = 0;
  /**
   * Map of node id (node path) and polymer nodes in the graph
   */
  nodeMap: Map<string, PolymerNode>;
  /**
   * Map of node id (node path) and polymer edges originating from the node
   */
  edgeMap: Map<string, PolymerEdge[]>;
  /**
   * Map of group id (container name) and number of times an edge connects to it
   */
  targetCountMap = new Map<string, number>();
  edgeContainerMap = new Map<string, PolymerEdge[]>();
  /**
   * Map of group id (container name) and all its immediate children
   */
  containerMap = new Map<string, string[]>();

  /**
   * Map of node ids (key) to a frequency counter (value) of the target groups (containers)
   * of the edges from a given node. Frequency counter is a record of the target group id (key)
   * and the number of edges from the source node conecting to it.
   */
  edgeGroupMap = new Map<string, Record<string, number>>();
  /**
   * Map of group ids (container name) and its associated multiplier (value).
   * Multipliers are based on the DP value of group being grafted from.
   */
  graftMultipliers = new Map<string, number>();
  /**
   * Multiplier for edges based on the quantity property (symmetry)
   */
  edgeMultiplier = 1;
  strategy?: PolymerStrategy;

  constructor(graph: PolymerGraph) {
    this.nodeMap = graph.nodes;
    this.edgeMap = graph.adjacencyList;
    this.groupEdges();
  }

  /**
   * Retrieves the degree of polymerization for a given node
   * in the polymer graph
   * @param node string name of node
   * @returns number
   */
  public getNodeDP(node: string): number {
    const nodeDp = this.nodeMap.get(node);

    if (!nodeDp) {
      throw new Error(`cannot find node ${node}`);
    } else {
      return nodeDp.getDegreePoly();
    }
  }

  /**
   * Retrieves edges for a given node in the polymer graph
   * @param node string
   * @returns PolymerEdge[]
   */
  public getEdge(node: string): PolymerEdge[] {
    const edge = this.edgeMap.get(node);

    if (!edge) {
      throw new Error(`cannot find edge ${node}`);
    } else {
      return edge;
    }
  }

  /**
   * Retrieves the edge group for a given node in the polymer graph
   * @param source string
   * @returns Record<string, number>
   */
  public getEdgeGroup(source: string): Record<string, number> {
    const edgeGroup = this.edgeGroupMap.get(source);

    if (!edgeGroup) {
      throw new Error(`unable to retrieve edgeGroup for ${source}`);
    }

    return edgeGroup;
  }

  /**
   * Visits root container in polymer composite tree and
   * selects a strategy for computing polymer weights
   * @param tree PolymerTree
   */
  public selectStrategy(tree: PolymerTree): void {
    const strategyBuilder = new StrategyVisitor();
    tree.visitRoot(strategyBuilder);
    this.strategy = strategyBuilder.createStrategy();
  }

  /**
   * Determines if a particular node is a repeat unit in the polymer graph
   * This is accomplished by checking if there are self-referencing edges
   * @param node string – name of node in polymer graph
   * @returns boolean
   */
  public isRepeatUnit(node: string): boolean {
    const edges = this.edgeMap.get(node);

    if (!edges) {
      throw new Error(`node ${node} does not exist in edge map`);
    }

    let isRepeat = false;
    for (const edge of edges) {
      if (edge.sourceName === edge.targetName) {
        isRepeat = true;
      }
    }

    return isRepeat;
  }

  /**
   * Iterates through edges in polymer graph and groups
   * edges by source.
   * 1. Iterates through adjacency list for each node
   * 2. Increments the target group count for both the sourceGroupMap and targetCountMap
   * 3. Sets result in edgeGroupMap
   *
   */
  private groupEdges(): void {
    for (const [nodeId, sourceEdges] of this.edgeMap.entries()) {
      const sourceGroupMap: Record<string, number> = {};
      for (const edge of sourceEdges) {
        const targetGroup = edge.getTargetGroup();
        this.setGroupItem(targetGroup, sourceGroupMap);

        const targetCount = this.targetCountMap.get(edge.targetName);

        if (targetCount) {
          this.targetCountMap.set(edge.targetName, targetCount + 1);
        } else {
          this.targetCountMap.set(edge.targetName, 1);
        }
      }
      this.edgeGroupMap.set(nodeId, sourceGroupMap);
    }
  }

  /**
   * Counts all edges between two groups in polymer graph
   * @TODO rename function with more descriptive name
   * @param sourceGroup string - group name for source container
   * @param targetGroup string - name for target container
   * @returns number
   */
  public getAllEdges(sourceGroup: string, targetGroup: string): number {
    let count = 0;
    for (const value of this.edgeMap.values()) {
      for (const edge of value) {
        if (
          edge.getSourceGroup() === sourceGroup &&
          edge.getTargetGroup() === targetGroup
        ) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Sets the count of a particular group item
   * @param key string
   * @param group Record<string, number>
   */
  private setGroupItem(key: string, group: Record<string, number>): void {
    if (group[key]) {
      group[key]++;
    } else {
      group[key] = 1;
    }
  }

  /**
   * Traverses polymer tree and computes a total score for use
   * in computing polymer weights for each node
   * @param tree PolymerTree
   */
  public scorePolymer(tree: PolymerTree): void {
    if (!this.strategy) {
      throw new Error("no strategy set for weighting polymer");
    }
    this.containerMap = tree.createContainerMap();
    const sideChainVisitor = new SideChainVisitor(this);
    tree.visit(sideChainVisitor);
    const edgeMultiplier = new EdgeMultiplier(this);
    tree.visit(edgeMultiplier);
    this.computePolymerScore();
  }

  /**
   * Traverses polymer tree and computes edge weights
   * @param tree PolymerTree
   */
  public weightPolymer(tree: PolymerTree) {
    const edgeWeight = new EdgeWeightor(this);
    tree.visit(edgeWeight);
  }

  /**
   * Sets a multiplier for a given group
   * @param group string
   * @param dp number
   * @param parentGroup string
   */
  public setGraftMultipliers(
    group: string,
    dp: number,
    parentGroup: string
  ): void {
    this.setMultiplier(group, dp);

    const otherGroups = this.findAllChildGroups(parentGroup);

    for (const other of otherGroups) {
      if (other !== group) {
        this.setMultiplier(other, dp);
      }
    }
  }

  /**
   * Sets a multiplier for computing molecular weights for a given group
   * @param group string
   * @param dp number
   */
  private setMultiplier(group: string, dp: number): void {
    const currentMultiplier = this.graftMultipliers.get(group);

    if (currentMultiplier) {
      this.graftMultipliers.set(group, dp * currentMultiplier);
    } else {
      this.graftMultipliers.set(group, dp);
    }
  }

  /**
   * Finds all children groups of a given group in the polymer
   * tree representation
   * @param parentGroup string
   * @returns string[]
   */
  private findAllChildGroups(parentGroup: string): string[] {
    const parent = this.containerMap.get(parentGroup);
    if (!parent) {
      throw new Error(`parent group: ${parentGroup} does not exist`);
    }

    const childContainers = [];
    const queue = [...parent];
    let curr: string | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      const currChildren = this.containerMap.get(curr);

      if (currChildren) {
        childContainers.push(curr);
        currChildren.forEach((el) => queue.push(el));
      }
    }

    return childContainers;
  }

  /**
   * Computes a polymer score based on a given strategy.
   * Scoring is influenced by presence or absence of end groups
   */
  private computePolymerScore(): void {
    if (!this.strategy) {
      throw new Error("strategy is not set");
    }

    let score = this.totalScore;
    const pseudoEndgroups = this.strategy.getPsuedoEndGroups();
    score += pseudoEndgroups;

    this.totalScore = score * this.edgeMultiplier;
  }
}
