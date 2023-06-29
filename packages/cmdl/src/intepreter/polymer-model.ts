import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "cmdl-polymers";
import { ModelType, TYPES } from "cmdl-types";
import { PROPERTIES } from "cmdl-types";

//build polymer model => implements model interface =>

export class Polymer extends BaseModel {
  private polymerContainer: PolymerContainer;
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER
  ) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getValue<TYPES.Reference>(PROPERTIES.TREE);
    const treeValues =
      this.modelAR.getOptionalValue<TYPES.PolymerTreeValue[]>("references");
    const polymerGraph = globalAR.getOptionalValue<TYPES.PolymerContainer>(
      treeRef.ref
    );

    if (!polymerGraph) {
      throw new Error(`Polymer graph for ${treeRef.ref} is undefined!`);
    }

    this.initializePolymer(polymerGraph, globalAR, this.polymerContainer);

    if (treeValues) {
      this.polymerContainer.addGraphValues(treeValues);
      this.polymerContainer.computePolymerWeights();
    }

    const polymerSmiles = this.polymerContainer.getSmilesStr();
    const state = this.modelAR.getValue<TYPES.ChemStates>("state");

    const properties: TYPES.Polymer = {
      name: this.name,
      type: ModelType.POLYMER,
      smiles: polymerSmiles,
      state: state,
    };

    for (const [name, value] of this.modelAR.all()) {
      if (name === PROPERTIES.TREE) {
        properties[name] = this.polymerContainer.treeToJSON();
      } else {
        properties[name as keyof TYPES.Polymer] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
