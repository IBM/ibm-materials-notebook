import { convertQty } from "../../cmdl-units";
import { Entity, EntityConfigValues, Exportable } from "./entity";
import { ModelType, TYPES } from "../../cmdl-types";

export class FragmentsGroup extends Entity<TYPES.Fragments> {
  public getFragmentMap() {
    const fragmentMap: Record<string, string> = {};

    for (const fragment of this.properties.fragments) {
      fragmentMap[fragment.name] = fragment.value;
    }

    return fragmentMap;
  }
}

export class ChemicalEntity
  extends Entity<TYPES.Chemical>
  implements Exportable
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

  public export(): TYPES.ChemicalExport {
    return {
      ...this.properties,
      name: this.name,
      density: this.properties.density
        ? convertQty(this.properties.density)
        : undefined,
      molecular_weight: convertQty(this.properties.molecular_weight),
    };
  }

  public render(): TYPES.ChemicalRender {
    return {
      ...this.export(),
      type: ModelType.CHEMICAL,
    };
  }
}
