import { ActivationRecord } from "../model-AR";
import { ModelType, TYPES } from "../../cmdl-types";
import { BaseModel } from "./base-model";
import { Entity, ChemicalEntity, FragmentsGroup } from "../entities";

/**
 * Model for reference groups. Tablulates child properties and merges into parent AR.
 */
export class GroupModel extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.GROUP | ModelType.CHEMICAL | ModelType.FRAGMENTS
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    if (this.type === ModelType.CHEMICAL) {
      const chemModel = new ChemicalEntity(this.name, this.type);
      this.copyProperties<TYPES.Chemical>(chemModel);
      globalAR.setValue(this.name, chemModel);
    } else if (this.type === ModelType.FRAGMENTS) {
      const fragmentModel = new FragmentsGroup(this.name, this.type);
      this.copyProperties<TYPES.Fragments>(fragmentModel);
      globalAR.setValue(this.name, fragmentModel);
    } else {
      throw new Error(`Invalid group model for ${this.name}: ${this.type}`);
    }
  }

  private copyProperties<T>(model: Entity<T>) {
    for (const [name, value] of this.modelAR.all()) {
      model.add(name as keyof T, value as T[keyof T]);
    }
  }
}
