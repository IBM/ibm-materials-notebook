import { PolymerEdge } from "./edge";
import { Container } from "./tree-container";
import { PolymerNode } from "./node";
import { PolymerTreeVisitor } from "./polymer-visitors";
import { TYPES } from "../cmdl-types";
import { PolymerComponent } from "./types";

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
        const edge = new PolymerEdge({
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

    const queue: PolymerComponent[] = [this.root];
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

    const queue: PolymerComponent[] = [this.root];

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

    const queue: PolymerComponent[] = [this.root];
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

    const queue: PolymerComponent[] = [this.root];
    let curr: PolymerComponent | undefined;

    let smiles = "";
    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr instanceof PolymerNode) {
        smiles = smiles.length ? `${smiles}.${curr.smiles}` : curr.smiles;
      }

      if (curr instanceof Container) {
        curr.children.forEach((el) => queue.push(el));
      }
    }

    return smiles;
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

    const queue: PolymerComponent[] = [this.root];
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
   * Converts tree to string for logging purposes
   * @returns string
   */
  public print(): string {
    if (!this.root) {
      return "Polymer tree not initialized";
    }

    let body = `Polymer Tree:\n******`;

    const queue = [this.root];
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

  public clone(): PolymerTree {
    const tree = new PolymerTree();
    if (!this.root) {
      return tree;
    }
    const clonedTree = this.root.clone();
    tree.root = clonedTree;
    return tree;
  }
}
