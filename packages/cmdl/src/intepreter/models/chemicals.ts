import { Model, EntityConfigValues, ChemicalEntity } from "./model";
import { TYPES } from "@ibm-materials/cmdl-types";

export class FragmentModel extends Model<TYPES.Fragments> {
  public getFragmentMap() {
    const fragmentMap: Record<string, string> = {};

    for (const fragment of this.properties.fragments) {
      fragmentMap[fragment.name] = fragment.value;
    }

    return fragmentMap;
  }
}

export class ChemicalModel
  extends Model<TYPES.Chemical>
  implements ChemicalEntity
{
  public getSMILES() {
    return this.properties.smiles;
  }

  public getConfigValues(): EntityConfigValues {
    if (!this.properties.molecular_weight) {
      throw new Error(`No molecular weight or state defined for ${this.name}`);
    }
    return {
      mw: this.properties.molecular_weight.value,
      density: this.properties.density?.value,
    };
  }
}
