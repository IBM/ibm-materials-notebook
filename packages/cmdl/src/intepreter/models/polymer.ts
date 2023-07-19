import { Model, ChemicalEntity, EntityConfigValues } from "./model";
import { FramgentModel } from "./chemicals";
import { TYPES, ModelType } from "cmdl-types";
import { PolymerContainer } from "cmdl-polymers";
import { ModelActivationRecord } from "../model-AR";
import Big from "big.js";
import { logger } from "../../logger";

export class PolymerGraphModel extends Model<TYPES.PolymerGraph> {
  private graph = new PolymerContainer(this.name);

  public clone(): this {
    const clone = Object.create(this);
    clone.graph = Object.create(this.graph);
    return clone;
  }

  public initializePolymerGraph(
    treeConfig: TYPES.PolymerContainer,
    record: ModelActivationRecord
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
        const fragment = record.getValue<FramgentModel>(node.ref.slice(1));
        const entity = this.graph.createPolymerNode(fragment.getNodeValues());
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

export class ComplexModel extends Model<TYPES.Complex> {}

export class PolymerModel
  extends Model<TYPES.Polymer>
  implements ChemicalEntity
{
  private graph?: PolymerGraphModel;

  public clone(): this {
    const clone = Object.create(this);
    if (this.graph) {
      const cloneGraph = this.graph.clone();
      clone.addGraph(cloneGraph);
    }
    return clone;
  }

  public addGraph(graph: PolymerGraphModel): void {
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

  public getConfigValues(): EntityConfigValues {
    if (!this.properties.state) {
      throw new Error(`Mn or state is undefined on ${this.name}`);
    }

    if (!!this.properties.mn_avg) {
      logger.warn(`Mn is not defined for ${this.name}...returning value of 1`);
    }

    return {
      mw: this.properties.mn_avg?.value || Big(1),
      state: this.properties.state,
    };
  }

  public export(): TYPES.Polymer {
    const graphExport = this.graph?.export();
    return {
      ...this.properties,
      smiles: graphExport?.smiles || "",
      name: this.name,
      type: this.type as ModelType.POLYMER,
    };
  }
}
