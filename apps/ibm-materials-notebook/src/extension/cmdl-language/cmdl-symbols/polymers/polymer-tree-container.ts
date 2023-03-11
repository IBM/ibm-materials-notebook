import { PolymerComponent } from "./polymer-types";
import { PolymerEdge } from "./polymer-edge";
import {
  EdgeWeightor,
  PolymerTreeVisitor,
  SideChainVisitor,
  StrategyVisitor,
  EdgeMultiplier,
} from "./polymer-weights";
import { JSONPolymerContainer } from "./polymer-container";

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
   * Exports polymer container to BigSMILES format
   * @returns string
   */
  public exportToBigSMILES(): string {
    const childBS = [];
    for (const child of this.children) {
      const childString = child.exportToBigSMILES();
      childBS.push(childString);
    }

    if (!this.parent) {
      return `{[]${childBS.join(", ")}[]}`;
    } else {
      return `{${childBS.join(", ")}}`;
    }
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
