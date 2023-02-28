import { cmdlLogger as logger } from "../../logger";
import { PolymerContainer } from "../polymers";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

/**
 * Model for creating polymer graph
 */
export class PolymerGraphModel extends BaseModel {
  private polymerContainer: PolymerContainer;

  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  execute(globalAR: ModelActivationRecord): void {
    // logger.debug(
    //   `executing model for ${this.name}: \n-${this.modelAR.print()}`
    // );

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
      const nodes = this.modelAR.getOptionalValue("nodes");
      const connections = this.modelAR.getOptionalValue("connections");
      const containers = this.modelAR.getOptionalValue("containers");

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
