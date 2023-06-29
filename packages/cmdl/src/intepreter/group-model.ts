import { ModelActivationRecord } from "./model-AR";
import { ModelType } from "cmdl-types";
import { BaseModel } from "./base-model";

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
    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
    };
    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    globalAR.setValue(this.name, properties);
  }
}
