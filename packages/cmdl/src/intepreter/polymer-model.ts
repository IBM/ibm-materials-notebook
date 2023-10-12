import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "@ibm-materials/cmdl-types";
import { PROPERTIES } from "@ibm-materials/cmdl-types";
import { PolymerModel, PolymerGraphModel } from "./models";

export class Polymer extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getValue<TYPES.Reference>(
      PROPERTIES.STRUCTURE
    );
    const treeValues =
      this.modelAR.getOptionalValue<TYPES.PolymerTreeValue[]>("references");
    const polymerGraph = globalAR.getOptionalValue<PolymerGraphModel>(
      treeRef.ref
    );

    if (!polymerGraph) {
      throw new Error(`Polymer graph for ${treeRef.ref} is undefined!`);
    }

    const polymerModel = new PolymerModel(this.name, this.type);
    polymerModel.addGraph(polymerGraph);

    if (treeValues) {
      polymerModel.embedNodeValues(treeValues);
    }

    for (const [name, value] of this.modelAR.all()) {
      polymerModel.add(
        name as keyof TYPES.Polymer,
        value as TYPES.Polymer[keyof TYPES.Polymer]
      );
    }

    globalAR.setValue(this.name, polymerModel);
  }
}
