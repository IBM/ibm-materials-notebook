import { PolymerContainer } from "cmdl-polymers";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, CMDL } from "cmdl-types";

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

  public execute(globalAR: ModelActivationRecord): void {
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
      const nodes = this.modelAR.getOptionalValue<CMDL.Reference[]>("nodes");
      const connections =
        this.modelAR.getOptionalValue<CMDL.PolymerConnection[]>("connections");
      const containers =
        this.modelAR.getOptionalValue<CMDL.PolymerContainer[]>("containers");

      const treeConfig = {
        name: this.name,
        nodes: nodes ? nodes : [],
        connections: connections ? connections : [],
        containers: containers ? containers : [],
      };

      // this.polymerContainer.buildTree(treeConfig, globalAR);
      this.polymerContainer.buildGraph();

      const graphOutput = {
        graph: this.polymerContainer.graphToJSON(),
        tree: this.polymerContainer.treeToJSON(),
        str: this.polymerContainer.graphToString(),
      };

      globalAR.setValue(this.name, {
        name: this.name,
        type: this.type,
        ...graphOutput,
      });
    }
  }
}
