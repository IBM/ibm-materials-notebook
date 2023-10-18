import { ActivationRecord } from "../model-AR";
import { GROUPS, ModelType, TYPES } from "@ibm-materials/cmdl-types";
import { BaseModel } from "./base-model";
import { Entity, ChemicalEntity, FragmentsGroup } from "../entities";
import { logger } from "../../logger";

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
    if (this.name === GROUPS.META) {
      const groupModel = new Entity<TYPES.MetaData>(this.name, this.type);
      this.copyProperties<TYPES.MetaData>(groupModel);
      globalAR.setValue(this.name, groupModel);
    } else if (this.type === ModelType.CHEMICAL) {
      const chemModel = new ChemicalEntity(this.name, this.type);
      this.copyProperties<TYPES.Chemical>(chemModel);
      globalAR.setValue(this.name, chemModel);
    } else if (this.type === ModelType.FRAGMENTS) {
      const fragmentModel = new FragmentsGroup(this.name, this.type);
      this.copyProperties<TYPES.Fragments>(fragmentModel);
      logger.silly(`group name: ${this.name}, globalAR: ${globalAR.name}`);
      globalAR.setValue(this.name, fragmentModel);
    } else {
      throw new Error(`Invalid group model for ${this.type}`);
    }
  }

  private copyProperties<T>(model: Entity<T>) {
    for (const [name, value] of this.modelAR.all()) {
      model.add(name as keyof T, value as T[keyof T]);
    }
  }
}
