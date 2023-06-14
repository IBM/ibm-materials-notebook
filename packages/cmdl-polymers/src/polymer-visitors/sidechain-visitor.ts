import { PolymerEdge } from "../edge";
import { PolymerComponent } from "../types";
import { Container } from "../tree-container";
import { PolymerWeight } from "../weights";
import { PolymerTreeVisitor } from "./strategy-visitor";

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
