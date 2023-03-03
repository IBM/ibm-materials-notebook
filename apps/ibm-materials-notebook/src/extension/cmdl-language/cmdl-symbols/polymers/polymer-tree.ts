import Big from "big.js";
import { ModelActivationRecord } from "../models";
import { PolymerEdge } from "./polymer-edge";
import { Container } from "./polymer-tree-container";
import { PolymerNode } from "./polymer-node";
import { PolymerTreeVisitor } from "./polymer-weights";
import { CMDLRef } from "../symbol-types";
import {
  CMDLPolymerTree,
  CMDLPolymerContainer,
  CMDLPolymerConnection,
  PolymerComponent,
} from "./polymer-types";

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
   * Initializes tree from values extracted from model activation record.
   * The globalAR is supplied as a second param to provide access to values for imported or defined fragments
   * @param treeConfig Object
   * @param record ModelActivationRecord
   */
  initialize(treeConfig: CMDLPolymerTree, record: ModelActivationRecord) {
    const queue: (CMDLPolymerTree | CMDLPolymerContainer)[] = [treeConfig];
    let curr: CMDLPolymerTree | CMDLPolymerContainer | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      const container = new Container(curr.name);

      for (const node of curr.nodes) {
        let fragment = record.getValue(node.ref.slice(1));

        const entity = new PolymerNode({
          fragment: node.ref.slice(1),
          mw: Big(fragment.molecular_weight.value),
          smiles: fragment.smiles,
        });

        container.add(entity);
      }

      if (curr?.connections) {
        for (const conn of curr.connections) {
          this.createEdges(conn, container);
        }

        if (curr?.containers?.length) {
          for (const cont of curr.containers) {
            cont.parent = curr.name;
            queue.unshift(cont);
          }
        }
      }

      this.insert(container, curr?.parent);
    }
  }

  private createEdges(conn: CMDLPolymerConnection, container: Container) {
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
  private parseConnectionPaths(arr: CMDLRef[]) {
    return arr.map((el: CMDLRef) => {
      return [el.ref.slice(1), ...el.path];
    });
  }

  /**
   * Inserts a container element into the polymer graph.
   * @param arg Container
   * @param parent string | undefined
   * @returns void
   */
  insert(arg: Container, parent?: string) {
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

  visitRoot(arg: PolymerTreeVisitor) {
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

  visit(arg: PolymerTreeVisitor) {
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

  compileSmiles() {
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
   * @param element any
   * @param parent Container
   */
  fromJSON(element: any, parent?: Container) {
    if (element?.connections) {
      const newContainer = new Container(element.name);

      for (const connection of element.connections) {
        let conn = new PolymerEdge({
          sourcePath: connection.source.split("."),
          targetPath: connection.target.split("."),
          weight: connection.weight,
          quantity: connection.quantity,
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

  createContainerMap() {
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
  toJSON() {
    if (!this.root) {
      return {};
    }

    return this.root.toJSON();
  }

  toBigSMILES() {
    if (!this.root) {
      throw new Error(`polymer tree is not initialized!`);
    }

    return this.root.exportToBigSMILES();
  }

  /**
   * Converts tree to string for logging purposes
   * @returns string
   */
  print() {
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
