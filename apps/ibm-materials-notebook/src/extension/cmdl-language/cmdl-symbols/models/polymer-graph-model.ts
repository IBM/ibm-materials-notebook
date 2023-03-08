import { PolymerContainer } from "../polymers";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { CMDLRef } from "../symbol-types";
import {
  CMDLPolymerConnection,
  CMDLPolymerContainer,
} from "../polymers/polymer-types";

export type CMDLPolymerGraph = {
  name: string;
  type: ModelType.POLYMER_GRAPH;
  graph: any;
  tree: any;
  str: string;
  maskedStr: string;
  compressedStr: string;
};

/**
 * Model for creating polymer graph
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

  execute(globalAR: ModelActivationRecord): void {
    const importedTree = this.modelAR.getOptionalValue("tree");

    if (importedTree) {
      const properties: Record<string, any> = {
        name: this.name,
        type: this.type,
      };

      for (const [name, value] of this.modelAR.all()) {
        properties[name] = value;
      }

      globalAR.setValue(this.name, properties);
    } else {
      const nodes = this.modelAR.getOptionalValue<CMDLRef[]>("nodes");
      const connections =
        this.modelAR.getOptionalValue<CMDLPolymerConnection[]>("connections");
      const containers =
        this.modelAR.getOptionalValue<CMDLPolymerContainer[]>("containers");

      const treeConfig = {
        name: this.name,
        nodes: nodes ? nodes : [],
        connections: connections ? connections : [],
        containers: containers ? containers : [],
      };

      this.polymerContainer.buildTree(treeConfig, globalAR);
      this.polymerContainer.buildGraph();

      const graphOutput = {
        graph: this.polymerContainer.graphToJSON(),
        tree: this.polymerContainer.treeToJSON(),
        str: this.polymerContainer.graphToString(),
        maskedStr: this.polymerContainer.graphToMaskedString(),
        compressedStr: this.polymerContainer.graphToCompressedString(),
      };

      globalAR.setValue(this.name, {
        name: this.name,
        type: this.type,
        ...graphOutput,
      });
    }
  }
}
