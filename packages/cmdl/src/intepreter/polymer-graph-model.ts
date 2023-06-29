import { PolymerContainer } from "cmdl-polymers";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";

/**
 * Model for creating polymer graph
 * TODO: merge with aggregator
 */
export class PolymerGraphModel extends BaseModel {
  private polymerContainer: PolymerContainer;

  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER_GRAPH
  ) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const nodes = this.modelAR.getValue<TYPES.Reference[]>("nodes");
    const connections =
      this.modelAR.getOptionalValue<TYPES.PolymerConnection[]>("connections");
    const containers =
      this.modelAR.getOptionalValue<TYPES.PolymerContainer[]>("components");

    // const treeConfig = {
    //   name: this.name,
    //   type: "graph_root",
    //   nodes: nodes ? nodes : [],
    //   connections: connections ? connections : [],
    //   containers: containers ? containers : [],
    // };

    //! deprecated => move to polymer definition
    // this.initializePolymer(treeConfig, globalAR, this.polymerContainer);
    // this.polymerContainer.build();

    // const graphOutput = {
    //   graph: this.polymerContainer.graphToJSON(),
    //   tree: this.polymerContainer.treeToJSON(),
    //   str: this.polymerContainer.graphToString(),
    // };

    globalAR.setValue(this.name, {
      name: this.name,
      type: this.type,
      nodes: nodes ? nodes : [],
      connections: connections ? connections : [],
      containers: containers ? containers : [],
    });
  }
}
