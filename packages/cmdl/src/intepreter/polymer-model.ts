import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { PROPERTIES } from "cmdl-types";
import { PolymerModel, PolymerGraphModel } from "./models";
import { logger } from "../logger";

export class Polymer extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getValue<TYPES.Reference>(PROPERTIES.TREE);
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

    logger.silly(
      `Polymer graph model: ${polymerGraph.name}\n\t${polymerGraph.printTree()}`
    );

    if (treeValues) {
      polymerModel.embedNodeValues(treeValues);
    }

    const state = this.modelAR.getValue<TYPES.ChemStates>("state");
    polymerModel.add("state" as keyof TYPES.Polymer, state);

    for (const [name, value] of this.modelAR.all()) {
      polymerModel.add(
        name as keyof TYPES.Polymer,
        value as TYPES.Polymer[keyof TYPES.Polymer]
      );
    }

    globalAR.setValue(this.name, polymerModel);
  }
}
