import { ModelActivationRecord } from "./model-AR";
import { ModelType } from "@ibm-materials/cmdl-types";
import { BaseModel } from "./base-model";

/**
 * Model for reference groups. Tablulates child properties and merges into parent AR.
 */
export class ReferenceGroupModel extends BaseModel {
  private path: string[];
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.REFERENCE_GROUP,
    path: string[] = []
  ) {
    super(name, modelAR, type);
    this.path = path;
  }

  public execute(globalAR: ModelActivationRecord): void {
    const properties: Record<string, any> = {
      name: this.name.slice(1),
      path: this.path,
    };
    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    globalAR.mergeArrayValue("references", properties);
  }
}
