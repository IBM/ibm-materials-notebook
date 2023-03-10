import { ModelActivationRecord } from "./model-AR";
import { cmdlLogger as logger } from "../../logger";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { BaseModel } from "./base-model";

/**
 * Model for reference groups. Tablulates child properties and merges into parent AR.
 */
export class GroupModel extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.GROUP
  ) {
    super(name, modelAR, type);
  }

  execute(globalAR: ModelActivationRecord): void {
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
