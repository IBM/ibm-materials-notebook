import { PolymerTree } from "./polymer-tree";
import { PolymerEdge } from "./polymer-edge";
import { PolymerNode } from "./polymer-node";
import { PolymerComponent } from "./polymer-types";
import { PolymerGraph } from "./polymer-graph";
import { Container } from "./polymer-tree-container";
import { cmdlLogger as logger } from "../../logger";
import Big from "big.js";

/**
 * Class for managing computation of polymer weights
 */
export class PolymerWeight {
  totalScore: number = 0;
  nodeMap: Map<string, PolymerNode>;
  edgeMap: Map<string, PolymerEdge[]>;
  targetCountMap = new Map<string, number>();
  edgeContainerMap = new Map<string, PolymerEdge[]>();
  containerMap = new Map<string, string[]>(); //name -> children name[]
  edgeGroupMap = new Map<string, Record<string, number>>();
  graftMultipliers = new Map<string, number>();
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
   * edges by source
   * @TODO improve documentation for this function
   */
  public groupEdges(): void {
    for (const [key, value] of this.edgeMap.entries()) {
      const sourceGroupMap: Record<string, number> = {};
      for (const edge of value) {
        const targetGroup = edge.getTargetGroup();
        this.setGroupItem(targetGroup, sourceGroupMap);

        let targetCount = this.targetCountMap.get(edge.targetName);

        if (targetCount) {
          this.targetCountMap.set(edge.targetName, targetCount + 1);
        } else {
          this.targetCountMap.set(edge.targetName, 1);
        }
      }
      this.edgeGroupMap.set(key, sourceGroupMap);
    }
  }

  /**
   * Counts all edges between two groups in polymer graph
   * @TODO rename function with more descriptive name
   * @param sourceGroup string - group name for source container
   * @param targetGroup string - name for target container
   * @returns number
   */
  getAllEdges(sourceGroup: string, targetGroup: string): number {
    let count = 0;
    for (const [key, value] of this.edgeMap.entries()) {
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

    let otherGroups = this.findAllChildGroups(parentGroup);

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
    let currentMultiplier = this.graftMultipliers.get(group);

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
    let parent = this.containerMap.get(parentGroup);
    if (!parent) {
      throw new Error(`parent group: ${parentGroup} does not exist`);
    }

    let childContainers = [];
    let queue = [...parent];
    let curr: string | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      let currChildren = this.containerMap.get(curr);

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

/**
 * Interface for visitors for PolymerTree
 */
export interface PolymerTreeVisitor {
  /**
   * Interface method for visiting elements on the polymer composite tree
   * @param arg PolymerComponent | PolymerEdge
   */
  visit(arg: PolymerComponent | PolymerEdge): void;
}

/**
 * Interface for polymer strategies
 */
interface PolymerStrategy {
  /**
   * Method for getting a value based on presence or absence of end-groups
   */
  getPsuedoEndGroups(): number;
}

/**
 * Strategy for weighting cyclic polymers
 */
class CycliStrategy implements PolymerStrategy {
  public getPsuedoEndGroups(): number {
    return 0;
  }
}

/**
 * Strategy for weighting linear strategy
 */
class LinearStrategy implements PolymerStrategy {
  hasEndCap: boolean = false;
  hasInitiatior: boolean = false;

  public getPsuedoEndGroups(): number {
    if (this.hasEndCap && this.hasInitiatior) {
      return 0;
    } else if (this.hasInitiatior && !this.hasEndCap) {
      return 1;
    } else if (!this.hasInitiatior && !this.hasEndCap) {
      return 2;
    } else {
      throw new Error("Invalid linear strategy state");
    }
  }
}

/**
 * Visitor to polymer tree used to decide which strategy is needed
 * for weighting polymers
 */
export class StrategyVisitor implements PolymerTreeVisitor {
  currentScope?: string;
  hasSubContainers: boolean = false;
  selfEdges = new Map<string, number>();
  sourceEdges = new Map<string, number>();
  nodes = new Set<string>();

  public visit(component: PolymerComponent | PolymerEdge): void {
    component.accept(this);
  }

  /**
   * Visits edge component in polymer composite tree
   * @param edge PolymerEdge
   * @returns void
   */
  public visitEdge(edge: PolymerEdge): void {
    if (edge.getSourceGroup() === this.currentScope) {
      this.nodes.add(edge.sourceName);
    }

    if (edge.getTargetGroup() === this.currentScope) {
      this.nodes.add(edge.targetName);
    }

    if (edge.sourceName === edge.targetName) {
      this.selfEdges.set(edge.sourceName, 1);
      return;
    }

    let sourceEdges = this.sourceEdges.get(edge.sourceName);

    if (!sourceEdges) {
      this.sourceEdges.set(edge.sourceName, 1);
    } else {
      let newCount = sourceEdges++;
      this.sourceEdges.set(edge.sourceName, newCount);
    }
  }

  /**
   * Visits container in polymer composite tree
   * @param container Container
   * @returns void
   */
  public visitContainer(container: Container): void {
    if (container.parent) {
      this.hasSubContainers = true;
      return;
    }

    this.currentScope = container.name;

    for (const edge of container.connections) {
      this.visit(edge);
    }
  }

  /**
   * Method to determine which strategy is needed for computing polymer weights
   * @returns PolymerStrategy
   */
  public createStrategy(): PolymerStrategy {
    if (this.hasSubContainers && this.selfEdges.size === 0) {
      const linear = new LinearStrategy();

      if (this.sourceEdges.size > 0) {
        linear.hasInitiatior = true;
      }

      for (const node of this.nodes.values()) {
        if (!this.sourceEdges.has(node)) {
          linear.hasEndCap = true;
        }
      }
      return linear;
    } else {
      return new CycliStrategy();
    }
  }
}

/**
 * Class to evaluate side-chains and determine correct mulitpliers
 * based on side chain identity
 */
export class SideChainVisitor implements PolymerTreeVisitor {
  currentScope: string = "ROOT";

  constructor(private weightor: PolymerWeight) {}

  public visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  //! May need to update logic and ensure source and target group are nested
  /**
   * Visits edge component in polymer composite tree
   * @param edge PolymerEdge
   */
  public visitEdge(edge: PolymerEdge): void {
    const sourceGroup = edge.getSourceGroup();
    const targetGroup = edge.getTargetGroup();
    if (
      sourceGroup !== this.currentScope &&
      targetGroup === this.currentScope &&
      this.weightor.isRepeatUnit(edge.targetName)
    ) {
      let targetDp = this.weightor.getNodeDP(edge.targetName);
      this.weightor.setGraftMultipliers(sourceGroup, targetDp, targetGroup);
    } else if (
      targetGroup !== this.currentScope &&
      sourceGroup === this.currentScope &&
      this.weightor.isRepeatUnit(edge.sourceName)
    ) {
      let sourceDp = this.weightor.getNodeDP(edge.sourceName);
      this.weightor.setGraftMultipliers(sourceGroup, sourceDp, sourceGroup);
    }
  }

  /**
   * Visits container element in polymer composite tree
   * @param container Container
   */
  public visitContainer(container: Container): void {
    this.currentScope = container.name;
    for (const edge of container.connections) {
      this.visit(edge);
    }
  }
}

/**
 * Class for assigning correct multipliers for various edges
 * encountered in a polymer composite tree
 */
export class EdgeMultiplier implements PolymerTreeVisitor {
  currentScope: string = "ROOT";
  visited = new Set<string>();
  multiGroupVisit = new Set<string>();

  constructor(private weightor: PolymerWeight) {}

  public visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  /**
   * Visits edge element in polymer composite tree
   * @param edge PolymerEdge
   * @returns void
   */
  public visitEdge(edge: PolymerEdge): void {
    const degreePoly = this.weightor.getNodeDP(edge.sourceName);
    const sourceGroup = edge.getSourceGroup();
    const targetGroup = edge.getTargetGroup();

    if (edge.sourceName === edge.targetName && degreePoly === 1) {
      return;
    } else if (edge.sourceName === edge.targetName) {
      const graftMultiplier = this.weightor.graftMultipliers.get(sourceGroup);
      let finalDp = degreePoly;
      if (graftMultiplier) {
        finalDp = finalDp * graftMultiplier;
      }
      this.weightor.totalScore += finalDp;
    } else if (
      sourceGroup === this.currentScope &&
      targetGroup !== this.currentScope
    ) {
      this.scoreMultiSourceEdges(edge, targetGroup);
    } else if (
      sourceGroup !== this.currentScope &&
      targetGroup === this.currentScope
    ) {
      this.scoreMultiTargetEdges(edge);
    } else if (
      sourceGroup !== this.currentScope &&
      targetGroup !== this.currentScope &&
      sourceGroup !== targetGroup
    ) {
      this.scoreMultiGroupEdges(edge, sourceGroup, targetGroup);
    } else {
      this.weightor.edgeMultiplier *= edge.quantity;
      this.weightor.totalScore++;
    }
  }

  /**
   * Scores mulitple edges between two groups
   * @param edge PolymerEdge
   * @param sourceGroup string
   * @param targetGroup strin
   */
  private scoreMultiGroupEdges(
    edge: PolymerEdge,
    sourceGroup: string,
    targetGroup: string
  ): void {
    let total = this.weightor.getAllEdges(sourceGroup, targetGroup);

    if (
      total > 1 &&
      !this.multiGroupVisit.has(sourceGroup) &&
      !this.multiGroupVisit.has(targetGroup)
    ) {
      this.weightor.totalScore++;
      this.weightor.edgeMultiplier *= edge.quantity;
      this.multiGroupVisit.add(targetGroup);
      this.multiGroupVisit.add(sourceGroup);
    } else {
      this.weightor.totalScore++;
      this.weightor.edgeMultiplier *= edge.quantity;
    }
  }

  /**
   * Scores multiple edges from a source group
   * @param edge PolymerEdge
   * @param targetGroup string
   * @returns void
   */
  private scoreMultiSourceEdges(edge: PolymerEdge, targetGroup: string): void {
    const edgeGroup = this.weightor.getEdgeGroup(edge.sourceName);
    const graftMultiplier = this.weightor.graftMultipliers.get(
      edge.getTargetGroup()
    );
    const numEdges = edgeGroup[targetGroup];

    if (numEdges > 1 && !this.visited.has(targetGroup)) {
      if (graftMultiplier) {
        this.weightor.totalScore += graftMultiplier;

        if (edge.quantity > 1) {
          logger.warn(
            `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          );
        }

        this.visited.add(targetGroup);
      } else {
        this.weightor.totalScore++;
        this.weightor.edgeMultiplier *= edge.quantity;
        this.visited.add(targetGroup);
      }
    } else if (numEdges > 1 && this.visited.has(targetGroup)) {
      return;
    } else {
      if (graftMultiplier) {
        this.weightor.totalScore += graftMultiplier;
        if (edge.quantity > 1) {
          logger.warn(
            `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          );
        }
      } else {
        this.weightor.edgeMultiplier *= edge.quantity;
        this.weightor.totalScore++;
      }
    }
  }

  /**
   * Scores multple edges to a target group
   * @param edge PolymerEdge
   * @returns void
   */
  private scoreMultiTargetEdges(edge: PolymerEdge): void {
    let numSources = this.weightor.targetCountMap.get(edge.targetName);
    const graftMultiplier = this.weightor.graftMultipliers.get(
      edge.getSourceGroup()
    );

    if (numSources && numSources > 1 && !this.visited.has(edge.targetName)) {
      if (graftMultiplier) {
        this.weightor.totalScore += graftMultiplier;

        if (edge.quantity > 1) {
          logger.warn(
            `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          );
        }

        this.visited.add(edge.targetName);
      } else {
        this.weightor.totalScore++;
        this.weightor.edgeMultiplier *= edge.quantity;
        this.visited.add(edge.targetName);
      }
    } else if (
      numSources &&
      numSources > 1 &&
      this.visited.has(edge.targetName)
    ) {
      return;
    } else {
      if (graftMultiplier) {
        this.weightor.totalScore += graftMultiplier;

        if (edge.quantity > 1) {
          logger.warn(
            `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          );
        }
      } else {
        this.weightor.totalScore++;
        this.weightor.edgeMultiplier *= edge.quantity;
      }
    }
  }

  /**
   * Visits a container element in a polymer composite tree
   * @param container Container
   */
  public visitContainer(container: Container) {
    this.currentScope = container.name;
    for (const edge of container.connections) {
      this.visit(edge);
    }
  }
}

/**
 * Class for properly weighting edges within a polymer composite tree
 */
export class EdgeWeightor implements PolymerTreeVisitor {
  currentScope: string = "ROOT";
  visited = new Set<string>();

  constructor(private weightor: PolymerWeight) {}

  public visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  /**
   * Visits edge element in a polymer composite tree
   * @param edge PolymerEdge
   */
  public visitEdge(edge: PolymerEdge): void {
    const degreePoly = this.weightor.getNodeDP(edge.sourceName);
    const sourceGroup = edge.getSourceGroup();
    const targetGroup = edge.getTargetGroup();

    if (edge.sourceName === edge.targetName && degreePoly === 1) {
      edge.weight = this.computeRepeatBaseCase();
    } else if (edge.sourceName === edge.targetName) {
      let numSelf = this.getCopolymerEdges(edge.sourceName);
      let graftMultiplier = this.weightor.graftMultipliers.get(sourceGroup);
      let finalDp = degreePoly;
      if (graftMultiplier) {
        finalDp = finalDp * graftMultiplier;
      }
      const finalWeight = this.computeRepeatWeight(finalDp, numSelf);
      edge.weight = finalWeight;
    } else if (
      sourceGroup === this.currentScope &&
      targetGroup !== this.currentScope
    ) {
      const edgeGroup = this.weightor.getEdgeGroup(edge.sourceName);
      const numEdges = edgeGroup[targetGroup];
      let graftMultiplier = this.weightor.graftMultipliers.get(sourceGroup);
      edge.weight = this.computeNonRepeatWeight(numEdges, graftMultiplier);
    } else if (
      sourceGroup !== this.currentScope &&
      targetGroup === this.currentScope
    ) {
      let graftMultiplier = this.weightor.graftMultipliers.get(sourceGroup);

      if (graftMultiplier) {
        edge.weight = this.computeNonRepeatWeight(1, graftMultiplier);
      } else {
        let numSources = this.weightor.targetCountMap.get(edge.targetName);
        edge.weight = this.computeNonRepeatWeight(numSources || 1);
      }
    } else if (
      sourceGroup !== this.currentScope &&
      targetGroup !== this.currentScope &&
      sourceGroup !== targetGroup
    ) {
      let total = this.weightor.getAllEdges(sourceGroup, targetGroup);
      edge.weight = this.computeNonRepeatWeight(total || 1);
    } else {
      let numSelf = this.getCopolymerEdges(edge.sourceName);
      let value = numSelf || 1;
      if (degreePoly === 1) {
        edge.weight = this.computeRepeatWeight(degreePoly, 1);
      } else {
        edge.weight = this.computeRepeatWeight(degreePoly, value);
      }
    }
  }

  /**
   * Visits container element in a polymer composite tree
   * @param container Container
   */
  public visitContainer(container: Container) {
    this.currentScope = container.name;

    for (const edge of container.connections) {
      this.visit(edge);
    }
  }

  /**
   * Gets edges for a statistical copolymer group
   * @param source string
   * @returns number
   */
  private getCopolymerEdges(source: string): number {
    const edges = this.weightor.getEdge(source);
    let count = 0;
    for (const edge of edges) {
      if (
        edge.sourceName === source &&
        edge.getSourceGroup() === edge.getTargetGroup()
      ) {
        count++;
      }
    }
    return count;
  }

  /**
   * Computes a base case on a basis of they current strategy
   * @returns 1 | 0
   */
  private computeRepeatBaseCase(): 1 | 0 {
    if (
      this.weightor.strategy &&
      this.weightor.strategy instanceof CycliStrategy
    ) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Computes a weight for a repeat unit
   * @param degreePoly number
   * @param numSelf number
   * @returns number
   */
  private computeRepeatWeight(degreePoly: number, numSelf: number): number {
    return Big(degreePoly)
      .div(numSelf)
      .div(this.weightor.totalScore)
      .round(4)
      .toNumber();
  }

  /**
   * Computes a non repeat weight
   * @param numEdges number
   * @param graftCount number
   * @returns number
   */
  private computeNonRepeatWeight(numEdges: number, graftCount: number = 1) {
    return Big(graftCount)
      .div(this.weightor.totalScore)
      .div(numEdges)
      .round(4)
      .toNumber();
  }
}
