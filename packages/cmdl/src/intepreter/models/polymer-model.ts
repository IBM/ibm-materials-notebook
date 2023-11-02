import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "../../cmdl-types";
import { PROPERTIES } from "../../cmdl-types";
import { PolymerGraphEntity, PolymerEntity } from "../entities";

export class Polymer extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.POLYMER
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    const treeRef = this.modelAR.getValue<TYPES.Reference>(
      PROPERTIES.STRUCTURE
    );
    const treeValues =
      this.modelAR.getOptionalValue<TYPES.PolymerTreeValue[]>("references");
    const polymerGraph = globalAR.getOptionalValue<PolymerGraphEntity>(
      treeRef.ref
    );

    if (!polymerGraph) {
      throw new Error(`Polymer graph for ${treeRef.ref} is undefined!`);
    }

    const polymerModel = new PolymerEntity(this.name, this.type);
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
