import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "../polymers";

export class Polymer extends BaseModel {
  private polymerContainer: PolymerContainer;
  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getOptionalValue("tree");
    const treeValues = this.modelAR.getOptionalValue("treeValues");

    if (treeRef?.ref) {
      const polymerGraph = globalAR.getOptionalValue(treeRef.ref);
      this.polymerContainer.initializeTreeFromJSON(polymerGraph.tree);
    } else {
      this.polymerContainer.initializeTreeFromJSON(treeRef);
    }

    if (treeValues) {
      this.polymerContainer.addGraphValues(treeValues);
      this.polymerContainer.computePolymerWeights();
    }

    const polymerSmiles = this.polymerContainer.getSmilesStr();

    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
      smiles: polymerSmiles,
    };

    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;

      if (name === "tree") {
        properties[name] = this.polymerContainer.treeToJSON();
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
