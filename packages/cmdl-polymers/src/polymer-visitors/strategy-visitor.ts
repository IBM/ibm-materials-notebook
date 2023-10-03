import { PolymerEdge } from "../edge";
import { PolymerComponent } from "../types";
import { Container } from "../tree-container";
import { PolymerStrategy, LinearStrategy, CycliStrategy } from "../strategies";

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
