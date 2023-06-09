import { PolymerEdge } from "../polymer-edge";
import { PolymerComponent } from "../polymer-types";
import { Container } from "../polymer-tree-container";
import { CycliStrategy } from "../polymer-strategies";
import { PolymerWeight } from "../polymer-weights";
import { PolymerTreeVisitor } from "./strategy-visitor";
import Big from "big.js";

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
