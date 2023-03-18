import { PolymerComponent } from "./polymer-types";
import { PolymerEdge } from "./polymer-edge";
import {
  EdgeWeightor,
  PolymerTreeVisitor,
  SideChainVisitor,
  StrategyVisitor,
  EdgeMultiplier,
} from "./polymer-visitors";
import { JSONPolymerContainer } from "./polymer-container";
import { PolymerNode } from "./polymer-node";

/**
 * Class for managing groups of nodes, other containers, and connections between them.
 */
export class Container implements PolymerComponent {
  properties = new Map<string, any>();
  connections: PolymerEdge[] = [];
  parent: Container | null = null;
  children: PolymerComponent[] = [];
  path?: string[];

  constructor(public name: string) {}

  public isContainer(): boolean {
    return true;
  }

  /**
   * Adds child entity or container and sets this container as parent
   * @param child PolymerComponent
   */
  public add(child: PolymerComponent): void {
    child.setParent(this);
    this.children.push(child);
  }

  /**
   * Sets the parent of current container
   * @param arg Container
   */
  public setParent(arg: Container): void {
    this.parent = arg;
  }

  /**
   * Recursively traces path to root node and returns it in an array
   * @param path string[]
   * @returns string[]
   */
  public getPath(path: string[]): string[] {
    path = [this.name, ...path];
    if (this.parent) {
      return this.parent.getPath(path);
    } else {
      return path;
    }
  }

  /**
   * Sets the path for the current container
   */
  public setPath(): void {
    this.path = this.getPath([]);

    for (const child of this.children) {
      if (child instanceof Container) {
        child.setPath();
      }
    }
  }

  /**
   * Converts paths in connection objects to absolute paths
   */
  public updateConnectionPaths(): void {
    if (!this.path) {
      throw new Error(`path on ${this.name} is not set!`);
    }

    for (const connection of this.connections) {
      connection.mergeBasePath(this.path);
    }

    for (const child of this.children) {
      if (child instanceof Container) {
        child.updateConnectionPaths();
      }
    }
  }

  /**
   * Sets the name for entity children
   */
  public setName(): void {
    this.children.map((el) => el.setName());
  }

  /**
   * Serializes container to object for exporting.
   * @returns Object
   */
  public toJSON(): JSONPolymerContainer {
    const containerRecord = {
      name: this.name,
      connections: this.connections.map((el) => el.toJSON()),
      parent: this.parent ? this.parent.name : null,
      children: this.children.map((el) => el.toJSON()),
    };

    return containerRecord;
  }

  /**
   * Accepts a polymer tree visitor for polymer weights computations
   * @param visitor PolymerTreeVisitor
   */
  public accept(visitor: PolymerTreeVisitor): void {
    if (visitor instanceof EdgeWeightor) {
      visitor.visitContainer(this);
    } else if (visitor instanceof EdgeMultiplier) {
      visitor.visitContainer(this);
    } else if (visitor instanceof StrategyVisitor) {
      visitor.visitContainer(this);
    } else if (visitor instanceof SideChainVisitor) {
      visitor.visitContainer(this);
    }
  }

  /**
   * Exports polymer container to BigSMILES format.
   * This method not viable for all polymer types
   * @returns string
   */
  public exportToBigSMILES(): string {
    const childBigSmiles = [];
    let leftEndgroup: PolymerNode | undefined,
      rightEndGroup: PolymerNode | undefined;
    for (const child of this.children) {
      if (child instanceof PolymerNode) {
        if (this.isRepeatUnit(child.name)) {
          let repeatUnitSmiles = child.exportToBigSMILES();
          childBigSmiles.push(repeatUnitSmiles);
        } else {
          if (this.isLeftEndGroup(child.name)) {
            leftEndgroup = child;
          } else {
            rightEndGroup = child;
          }
        }
      } else {
        let containerSmiles = child.exportToBigSMILES();
        childBigSmiles.push(containerSmiles);
      }
    }

    if (!leftEndgroup && !rightEndGroup && !this.parent) {
      return `{[]${childBigSmiles.join(", ")}[]}`;
    }
    if (leftEndgroup && rightEndGroup) {
      const left = leftEndgroup.exportToBigSMILES();
      const right = rightEndGroup.exportToBigSMILES();
      return `${left}{[>]${childBigSmiles.join(", ")}[<]}${right}`;
    } else {
      return `{${childBigSmiles.join(", ")}}`;
    }
  }

  /**
   * Determines if node is a repeat unit
   * @param nodeId string name of the node
   * @returns boolean
   */
  private isRepeatUnit(nodeId: string): boolean {
    for (const edge of this.connections) {
      if (edge.sourceName === edge.targetName && edge.sourceName === nodeId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Determines the type of end group
   * @param nodeId string name of the polymer node
   * @returns boolean
   */
  private isLeftEndGroup(nodeId: string): boolean {
    for (const edge of this.connections) {
      if (edge.sourceName === nodeId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Converts to string for logging
   * @returns string
   */
  public print(): string {
    return `container ${this.name}:\n-----\nconnections:\n${this.connections
      .map((el) => el.print())
      .join("\n")}\nchildren:\n${this.children
      .map((el) => el.print())
      .join("\n")}\n-----`;
  }
}
