import { Model, EntityConfigValues, ChemicalEntity } from "./model";
import { TYPES } from "cmdl-types";

export class FramgentModel extends Model<TYPES.Fragment> {
  public getNodeValues() {
    return {
      smiles: this.properties.smiles,
      mw: this.properties.molecular_weight.value,
      fragment: this.name,
    };
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
    if (!this.properties.molecular_weight || !this.properties.state) {
      throw new Error(`No molecular weight or state defined for ${this.name}`);
    }
    return {
      mw: this.properties.molecular_weight.value,
      density: this.properties.density?.value,
      state: this.properties.state,
    };
  }
}
