import { ModelActivationRecord } from "./model-AR";
import { ModelType, TYPES } from "cmdl-types";
import { BaseModel } from "./base-model";
import { Model, ChemicalModel, FramgentModel } from "./models";

/**
 * Model for reference groups. Tablulates child properties and merges into parent AR.
 */
export class GroupModel extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.GROUP | ModelType.CHEMICAL | ModelType.FRAGMENT
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    if (this.type === ModelType.GROUP) {
      const groupModel = new Model<any>(this.name, this.type);
      this.copyProperties<any>(groupModel, this.modelAR);
      globalAR.setValue(this.name, groupModel);
    } else if (this.type === ModelType.CHEMICAL) {
      const chemModel = new ChemicalModel(this.name, this.type);
      this.copyProperties<TYPES.Chemical>(chemModel, this.modelAR);
      globalAR.setValue(this.name, chemModel);
    } else if (this.type === ModelType.FRAGMENT) {
      const fragmentModel = new FramgentModel(this.name, this.type);
      this.copyProperties<TYPES.Fragment>(fragmentModel, this.modelAR);
      globalAR.setValue(this.name, fragmentModel);
    } else {
      throw new Error(`Invalid group model for ${this.type}`);
    }
  }

  private copyProperties<T>(model: Model<T>, modelAR: ModelActivationRecord) {
    for (const [name, value] of this.modelAR.all()) {
      model.add(name as keyof T, value as T[keyof T]);
    }
  }
}
