import Big from "big.js";
import { PolymerEdge } from "./edge";
import { Container } from "./tree-container";
import { PolymerNode } from "./node";
import { PolymerTreeVisitor } from "./polymer-visitors";
import { TYPES } from "cmdl-types";
import { PolymerComponent } from "./types";
import {
  JSONPolymerContainer,
  JSONPolymerNode,
  JSONPolymerTree,
} from "./container";

/**
 * Tree representation of polymer structure. The tree representation enables facile conversion to a graph representation.
 */
export class PolymerTree {
  root: Container | null = null;

  getBaseName() {
    if (!this.root) {
      throw new Error(`polymer tree root is not set`);
    }

    return this.root.name;
  }

  /**
   * Creates a new PolymerEdge object for the polymer tree
   * @param conn CMDLPolymerConnection
   * @param container Container
   */
  public createEdges(conn: TYPES.PolymerConnection, container: Container) {
    const newSources = this.parseConnectionPaths(conn.sources);
    const newTargets = this.parseConnectionPaths(conn.targets);

    let source: string[] | undefined;

    while (newSources.length) {
      source = newSources.shift();

      if (!source) {
        break;
      }

      for (const target of newTargets) {
        let edge = new PolymerEdge({
          sourcePath: source,
          targetPath: target,
          weight: 1,
          quantity: parseInt(conn.quantity),
        });

        container.connections.push(edge);
      }
    }
  }

  /**
   * Converts parsed connection paths to an array of string arrays
   * @param arr CMDLRef[][]
   * @returns string[][]
   */
  private parseConnectionPaths(arr: TYPES.Reference[]): string[][] {
    return arr.map((el) => {
      return [el.ref.slice(1), ...el.path];
    });
  }

  /**
   * Inserts a container element into the polymer graph.
   * @param arg Container
   * @param parent string | undefined
   * @returns void
   */
  public insert(arg: Container, parent?: string): void {
    if (!this.root) {
      this.root = arg;
      return;
    }

    if (!parent) {
      throw new Error(
        `cannot insert container ${arg.name} as parent is undefined`
      );
    }

    let queue: PolymerComponent[] = [this.root];
    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr instanceof Container && curr.name === parent) {
        curr.add(arg);
      } else if (curr instanceof Container) {
        curr.children.forEach((el) => queue.push(el));
      } else {
        continue;
      }
    }
  }

  /**
   * Visits root and only its immediate children
   * @param arg PolymerTreeVisitor
   */
  public visitRoot(arg: PolymerTreeVisitor): void {
    if (!this.root) {
      throw new Error(`cannot visit an undefined polymer`);
    }

    let queue: PolymerComponent[] = [this.root];

    this.root.children.forEach((el) => {
      queue.push(el);
    });

    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      curr.accept(arg);
    }
  }

  /**
   * Iterates through polymer tree and visits each element
   * which can accept a PolymerTreeVisitor. Used for computing
   * weights on the polymer graph.
   * @param arg PolymerTreeVisitor
   */
  public visit(arg: PolymerTreeVisitor): void {
    if (!this.root) {
      throw new Error(`cannot visit an undefined polymer`);
    }

    let queue: PolymerComponent[] = [this.root];
    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      curr.accept(arg);

      if (curr instanceof Container) {
        curr.children.forEach((el) => queue.push(el));
      }
    }
  }

  /**
   * Compiles polymer tree to SMILES string with "." character
   * separating each node
   * @returns string
   */
  public compileSmiles(): string {
    if (!this.root) {
      throw new Error(`cannot visit an undefined polymer`);
    }

    let queue: PolymerComponent[] = [this.root];
    let curr: PolymerComponent | undefined;

    let smiles = "";
    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr instanceof PolymerNode) {
        smiles = smiles.length
          ? `${smiles}.${curr.getSmiles()}`
          : curr.getSmiles();
      }

      if (curr instanceof Container) {
        curr.children.forEach((el) => queue.push(el));
      }
    }

    return smiles;
  }

  /**
   * Creates polymer tree from JSON representation
   * @param element JSONPolymerGraph
   * @param parent Container
   */
  public fromJSON(
    element: JSONPolymerTree<null | string> | JSONPolymerNode,
    parent?: Container
  ): void {
    if ("connections" in element) {
      const newContainer = new Container(element.name);

      for (const connection of element.connections) {
        let conn = new PolymerEdge({
          sourcePath: connection.source.split("."),
          targetPath: connection.target.split("."),
          weight: connection.weight,
          quantity: parseInt(connection.quantity),
        });
        newContainer.connections.push(conn);
      }

      if (!parent && !this.root) {
        this.root = newContainer;
      } else if (parent) {
        parent.add(newContainer);
      } else {
        throw new Error(`Invalid parent for container: ${element.name}`);
      }

      if (element.children.length) {
        for (const child of element.children) {
          this.fromJSON(child, newContainer);
        }
      }
    } else {
      const namePath = element.name.split(".");
      const fragment = namePath[namePath.length - 1];
      const newNode = new PolymerNode({
        fragment,
        mw: Big(element.mw),
        smiles: element.smiles,
      });

      if (element.degree_poly) {
        newNode.properties.set("degree_poly", element.degree_poly);
      }

      if (!parent) {
        throw new Error(`Invalid parent for node: ${namePath}`);
      }
      parent.add(newNode);
    }
  }

  /**
   * Creates a JS Map of all containers in the polymer graph
   * @returns Map<string, string[]>
   */
  public createContainerMap(): Map<string, string[]> {
    if (!this.root) {
      throw new Error(`cannot visit an undefined polymer`);
    }
    const containerMap = new Map<string, string[]>();

    let queue: PolymerComponent[] = [this.root];
    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr instanceof Container) {
        const containerChildren = curr.children.map((el) => {
          const childName = el.name.split(".");
          return childName[childName.length - 1];
        });
        containerMap.set(curr.name, containerChildren);
        curr.children.forEach((el) => queue.push(el));
      }
    }

    return containerMap;
  }

  /**
   * Serializes tree to an object
   * @returns Object
   */
  public toJSON(): JSONPolymerContainer {
    if (!this.root) {
      return {} as JSONPolymerContainer;
    }

    return this.root.toJSON();
  }

  /**
   * Method to convert the polymer tree to the BigSMILES string
   * @deprecated
   * @returns string
   */
  public toBigSMILES(): string {
    if (!this.root) {
      throw new Error(`polymer tree is not initialized!`);
    }

    return this.root.exportToBigSMILES();
  }

  /**
   * Converts tree to string for logging purposes
   * @returns string
   */
  public print(): string {
    if (!this.root) {
      return "Polymer tree not initialized";
    }

    let body = `Polymer Tree:\n******`;

    let queue = [this.root];
    let curr: PolymerComponent | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      body = body + "\n" + curr.print();
    }

    return body;
  }
}
