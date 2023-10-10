import { PolymerEdge } from "../edge";
import { PolymerComponent } from "../types";
import { Container } from "../tree-container";
import { PolymerWeight } from "../weights";
import { PolymerTreeVisitor } from "./strategy-visitor";
// import { cmdlLogger as logger } from "../../../logger";

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
    const total = this.weightor.getAllEdges(sourceGroup, targetGroup);

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
          // logger.warn(
          //   `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          // );
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
          // logger.warn(
          //   `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          // );
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
    const numSources = this.weightor.targetCountMap.get(edge.targetName);
    const graftMultiplier = this.weightor.graftMultipliers.get(
      edge.getSourceGroup()
    );

    if (numSources && numSources > 1 && !this.visited.has(edge.targetName)) {
      if (graftMultiplier) {
        this.weightor.totalScore += graftMultiplier;

        if (edge.quantity > 1) {
          // logger.warn(
          //   `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          // );
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
          // logger.warn(
          //   `network material encountered: ${edge.sourceName} -> ${edge.targetName}, edge multiplier unchanged`
          // );
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
