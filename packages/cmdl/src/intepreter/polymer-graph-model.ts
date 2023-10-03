import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { FragmentModel, PolymerGraphModel } from "./models";
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
      const fragmentModel =
        globalAR.getOptionalValue<FragmentModel>("fragments");
      const localFragments =
        this.modelAR.getOptionalValue<TYPES.Fragment[]>("fragments");

      let fragmentMap: Record<string, string> = {};

      if (fragmentModel) {
        const modelMap = fragmentModel.getFragmentMap();

        fragmentMap = { ...fragmentMap, ...modelMap };
      }

      if (localFragments?.length) {
        for (const fragment of localFragments) {
          fragmentMap[fragment.name] = fragment.value;
        }
      }

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
