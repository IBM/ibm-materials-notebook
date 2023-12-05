import { Entity, EntityConfigValues, Exportable, Renderable } from "./entity";
import { TYPES, ModelType } from "../../cmdl-types";
import { PolymerContainer } from "../../cmdl-polymers";
import Big from "big.js";
import { logger } from "../../logger";
import { convertQty } from "../../cmdl-units";

export class PolymerGraphEntity extends Entity<TYPES.PolymerGraph> {
  private graph = new PolymerContainer(this.name);

  public clone(): PolymerGraphEntity {
    const clone = new PolymerGraphEntity(this.name, this.type);
    clone.graph = this.graph.clone();
    return clone;
  }

  public initializePolymerGraph(
    treeConfig: TYPES.PolymerContainer,
    fragmentMap: Record<string, string>
  ): void {
    const queue: TYPES.PolymerContainer[] = [treeConfig];
    let curr: TYPES.PolymerContainer | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      const container = this.graph.createPolymerContainer(curr.name);

      for (const node of curr.nodes) {
        const fragmentName = node.ref.slice(1);
        const fragmentSmiles = fragmentMap[fragmentName];
        const entity = this.graph.createPolymerNode(
          fragmentName,
          fragmentSmiles
        );
        container.add(entity);
      }

      if (curr?.connections) {
        for (const conn of curr.connections) {
          this.graph.createPolymerEdges(conn, container);
        }

        if (curr?.containers?.length) {
          for (const cont of curr.containers) {
            cont.parent = curr.name;
            queue.unshift(cont);
          }
        }
      }

      this.graph.insertContainer(container, curr?.parent);
    }
    this.graph.build();
  }

  public printTree() {
    return this.graph.tree.print();
  }

  public insertNodeProperties(values: TYPES.PolymerTreeValue[]): void {
    this.graph.addGraphValues(values);
    this.graph.computePolymerWeights();
  }

  public getGraphSmiles() {
    return this.graph.getSmilesStr();
  }

  public getGraphStr() {
    return this.graph.graphToString();
  }

  public export() {
    return {
      smiles: this.graph.getSmilesStr(),
      str: this.graph.graphToString(),
      name: this.name,
      type: this.type as ModelType.POLYMER_GRAPH,
    };
  }
}

export class ComplexEntity extends Entity<TYPES.Complex> {}

export class PolymerEntity
  extends Entity<TYPES.Polymer>
  implements Exportable, Renderable
{
  private graph?: PolymerGraphEntity;

  public clone() {
    const clone = new PolymerEntity(this.name, this.type);
    if (this.graph) {
      const cloneGraph = this.graph.clone();
      clone.addGraph(cloneGraph);
    }

    for (const [key, value] of Object.entries(this.properties)) {
      clone.add(key as keyof TYPES.Polymer, value);
    }

    return clone;
  }

  public addGraph(graph: PolymerGraphEntity): void {
    this.graph = graph;
  }

  public embedNodeValues(values: TYPES.PolymerTreeValue[]) {
    if (!this.graph) {
      throw Error(`polymer graph is undefined on ${this.name}`);
    }
    this.graph.insertNodeProperties(values);
  }

  public getGraphString(): string {
    if (!this.graph) {
      throw new Error(`polymer graph is undefined on ${this.name}`);
    }
    return this.graph.getGraphStr();
  }

  public getSMILES() {
    if (!this.graph) {
      throw new Error(`polymer graph is undefined on ${this.name}`);
    }
    return this.graph.getGraphSmiles();
  }

  public getConfigValues(): EntityConfigValues {
    if (!this.properties.mn_avg) {
      logger.warn(`Mn is not defined for ${this.name}...returning value of 1`);
    }

    return {
      mw: this.properties.mn_avg?.value || Big(1),
    };
  }

  public export(): TYPES.PolymerExport {
    const polymerExport: TYPES.PolymerExport = {
      ...this.properties,
      name: this.name,
      mn_avg: this.properties.mn_avg
        ? convertQty(this.properties.mn_avg)
        : undefined,
      mw_avg: this.properties.mw_avg
        ? convertQty(this.properties.mw_avg)
        : undefined,
    };

    const graphExport = this.graph?.export();

    if (graphExport) {
      polymerExport.smiles = graphExport.smiles;
      polymerExport.graph_string = graphExport.str;
    }

    return polymerExport;
  }

  public render(): TYPES.PolymerRender {
    return {
      ...this.export(),
      type: ModelType.POLYMER,
    };
  }
}
