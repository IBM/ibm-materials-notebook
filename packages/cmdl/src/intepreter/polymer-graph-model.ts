import { PolymerContainer } from "cmdl-polymers";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";

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
    //! deprecated: refactoring import resolution...
    const importedTree = this.modelAR.getOptionalValue("tree");

    //! deprecated: refactoring import resolution
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
      const nodes = this.modelAR.getValue<TYPES.Reference[]>("nodes");
      const connections =
        this.modelAR.getOptionalValue<TYPES.PolymerConnection[]>("connections");
      const containers =
        this.modelAR.getOptionalValue<TYPES.PolymerContainer[]>("containers");

      const treeConfig = {
        name: this.name,
        type: "graph_root",
        nodes: nodes ? nodes : [],
        connections: connections ? connections : [],
        containers: containers ? containers : [],
      };

      this.initializePolymer(treeConfig, globalAR, this.polymerContainer);
      this.polymerContainer.build();

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
