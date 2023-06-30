import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { PolymerGraphModel } from "./base-model";
import { logger } from "../logger";

/**
 * Model for creating polymer graph
 */
export class PolymerGraph extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER_GRAPH
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const nodes = this.modelAR.getValue<TYPES.Reference[]>("nodes");
      const connections =
        this.modelAR.getOptionalValue<TYPES.PolymerConnection[]>("connections");
      const containers =
        this.modelAR.getOptionalValue<TYPES.PolymerContainer[]>("components");

      const polymerGraph = new PolymerGraphModel(this.name, this.type);

      const treeConfig = {
        name: this.name,
        type: "graph_root",
        nodes: nodes ? nodes : [],
        connections: connections ? connections : [],
        containers: containers ? containers : [],
      };

      polymerGraph.initializePolymerGraph(treeConfig, globalAR);

      globalAR.setValue(this.name, polymerGraph);
    } catch (error) {
      throw new Error(
        `Error during building polymer graph model ${this.name}: ${error}`
      );
    }
  }
}
