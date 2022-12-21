import { PolymerTree } from "./polymer-tree";
import { PolymerEdge } from "./polymer-edge";
import { PolymerNode } from "./polymer-node";
import { PolymerComponent } from "./polymer-tree";
import { PolymerGraph } from "./polymer-graph";
import { Container } from "./polymer-tree-container";
import { cmdlLogger as logger } from "../../logger";
import Big from "big.js";

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

  getNodeDP(node: string) {
    const nodeDp = this.nodeMap.get(node);

    if (!nodeDp) {
      throw new Error(`cannot find node ${node}`);
    } else {
      return nodeDp.getDegreePoly();
    }
  }

  getEdge(node: string) {
    const edge = this.edgeMap.get(node);

    if (!edge) {
      throw new Error(`cannot find edge ${node}`);
    } else {
      return edge;
    }
  }

  getEdgeGroup(source: string) {
    const edgeGroup = this.edgeGroupMap.get(source);

    if (!edgeGroup) {
      throw new Error(`unable to retrieve edgeGroup for ${source}`);
    }

    return edgeGroup;
  }

  selectStrategy(tree: PolymerTree) {
    const strategyBuilder = new StrategyVisitor();
    tree.visitRoot(strategyBuilder);
    this.strategy = strategyBuilder.createStrategy();
  }

  isRepeatUnit(node: string) {
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

  groupEdges() {
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

  getAllEdges(sourceGroup: string, targetGroup: string) {
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

  private setGroupItem(key: string, group: Record<string, number>) {
    if (group[key]) {
      group[key]++;
    } else {
      group[key] = 1;
    }
  }

  scorePolymer(tree: PolymerTree) {
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

  weightPolymer(tree: PolymerTree) {
    const edgeWeight = new EdgeWeightor(this);
    tree.visit(edgeWeight);
  }

  setGraftMultipliers(group: string, dp: number, parentGroup: string) {
    this.setMultiplier(group, dp);

    let otherGroups = this.findAllChildGroups(parentGroup);

    for (const other of otherGroups) {
      if (other !== group) {
        this.setMultiplier(other, dp);
      }
    }
  }

  private setMultiplier(group: string, dp: number) {
    let currentMultiplier = this.graftMultipliers.get(group);

    if (currentMultiplier) {
      this.graftMultipliers.set(group, dp * currentMultiplier);
    } else {
      this.graftMultipliers.set(group, dp);
    }
  }

  private findAllChildGroups(parentGroup: string) {
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

  private computePolymerScore() {
    if (!this.strategy) {
      throw new Error("strategy is not set");
    }

    let score = this.totalScore;
    const pseudoEndgroups = this.strategy.getPsuedoEndGroups();
    score += pseudoEndgroups;

    this.totalScore = score * this.edgeMultiplier;
  }
}

export interface PolymerTreeVisitor {
  visit(arg: PolymerComponent | PolymerEdge): void;
}

interface PolymerStrategy {
  getPsuedoEndGroups(): number;
}

class CycliStrategy implements PolymerStrategy {
  getPsuedoEndGroups(): number {
    return 0;
  }
}

class LinearStrategy implements PolymerStrategy {
  hasEndCap: boolean = false;
  hasInitiatior: boolean = false;

  getPsuedoEndGroups(): number {
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

export class StrategyVisitor implements PolymerTreeVisitor {
  currentScope?: string;
  hasSubContainers: boolean = false;
  selfEdges = new Map<string, number>();
  sourceEdges = new Map<string, number>();
  nodes = new Set<string>();

  visit(component: PolymerComponent | PolymerEdge) {
    component.accept(this);
  }

  visitEdge(edge: PolymerEdge) {
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

  visitContainer(container: Container) {
    if (container.parent) {
      this.hasSubContainers = true;
      return;
    }

    this.currentScope = container.name;

    for (const edge of container.connections) {
      this.visit(edge);
    }
  }

  createStrategy() {
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

export class SideChainVisitor implements PolymerTreeVisitor {
  currentScope: string = "ROOT";
  constructor(private weightor: PolymerWeight) {}
  visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  //! May need to update logic and ensure source and target group are nested
  visitEdge(edge: PolymerEdge) {
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

  visitContainer(container: Container) {
    this.currentScope = container.name;
    for (const edge of container.connections) {
      this.visit(edge);
    }
  }
}

export class EdgeMultiplier implements PolymerTreeVisitor {
  currentScope: string = "ROOT";
  visited = new Set<string>();
  multiGroupVisit = new Set<string>();
  constructor(private weightor: PolymerWeight) {}

  visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  visitEdge(edge: PolymerEdge) {
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

  private scoreMultiGroupEdges(
    edge: PolymerEdge,
    sourceGroup: string,
    targetGroup: string
  ) {
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

  private scoreMultiSourceEdges(edge: PolymerEdge, targetGroup: string) {
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

  private scoreMultiTargetEdges(edge: PolymerEdge) {
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

  visitContainer(container: Container) {
    this.currentScope = container.name;
    for (const edge of container.connections) {
      this.visit(edge);
    }
  }
}

export class EdgeWeightor implements PolymerTreeVisitor {
  currentScope: string = "ROOT";
  visited = new Set<string>();

  constructor(private weightor: PolymerWeight) {}

  visit(arg: PolymerComponent | PolymerEdge): void {
    arg.accept(this);
  }

  visitEdge(edge: PolymerEdge) {
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
      const finalWeight = this.computeRepeateWeight(finalDp, numSelf);
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
        edge.weight = this.computeRepeateWeight(degreePoly, 1);
      } else {
        edge.weight = this.computeRepeateWeight(degreePoly, value);
      }
    }
  }

  visitContainer(container: Container) {
    this.currentScope = container.name;

    for (const edge of container.connections) {
      this.visit(edge);
    }
  }

  private getCopolymerEdges(source: string) {
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

  private computeRepeatBaseCase() {
    if (
      this.weightor.strategy &&
      this.weightor.strategy instanceof CycliStrategy
    ) {
      return 1;
    } else {
      return 0;
    }
  }

  private computeRepeateWeight(degreePoly: number, numSelf: number) {
    return Big(degreePoly)
      .div(numSelf)
      .div(this.weightor.totalScore)
      .round(4)
      .toNumber();
  }

  private computeNonRepeatWeight(numEdges: number, graftCount: number = 1) {
    return Big(graftCount)
      .div(this.weightor.totalScore)
      .div(numEdges)
      .round(4)
      .toNumber();
  }
}
