import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "cmdl-polymers";
import { ModelType, TYPES } from "cmdl-types";
import { PROPERTIES } from "cmdl-types";

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
      this.modelAR.getOptionalValue<TYPES.PolymerTreeValue[]>("treeValues");

    if ("ref" in treeRef) {
      const polymerGraph = globalAR.getOptionalValue<TYPES.PolymerGraph>(
        treeRef.ref
      );

      if (!polymerGraph) {
        throw new Error(`Polymer graph for ${treeRef.ref} is undefined!`);
      }

      this.polymerContainer.initializeTreeFromJSON(polymerGraph.tree);
    } else {
      //! deprecated for import resolution
      // this.polymerContainer.initializeTreeFromJSON(treeRef);
      throw new Error(`Deprecated initialization from JSON`);
    }

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
