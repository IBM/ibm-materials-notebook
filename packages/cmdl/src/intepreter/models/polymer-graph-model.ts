import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "@ibm-materials/cmdl-types";
import { FragmentsGroup, PolymerGraphEntity } from "../entities";

/**
 * Model for creating polymer graph
 */
export class PolymerGraph extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.POLYMER_GRAPH
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    try {
      const fragmentModel = globalAR.getValue<FragmentsGroup>("fragments");

      let fragmentMap: Record<string, string> = {};

      if (fragmentModel) {
        const modelMap = fragmentModel.getFragmentMap();

        fragmentMap = { ...fragmentMap, ...modelMap };
      }

      const nodes = this.modelAR.getValue<TYPES.Reference[]>("nodes");
      const connections =
        this.modelAR.getOptionalValue<TYPES.PolymerConnection[]>("connections");
      const containers =
        this.modelAR.getOptionalValue<TYPES.PolymerContainer[]>("components");

      const polymerGraph = new PolymerGraphEntity(this.name, this.type);

      const treeConfig = {
        name: this.name,
        type: "graph_root",
        nodes: nodes ? nodes : [],
        connections: connections ? connections : [],
        containers: containers ? containers : [],
      };
      // logger.debug(`tree config`, { meta: treeConfig });

      polymerGraph.initializePolymerGraph(treeConfig, fragmentMap);

      globalAR.setValue(this.name, polymerGraph);
    } catch (error) {
      throw new Error(
        `Error during building polymer graph model ${this.name}: ${error}`
      );
    }
  }
}
