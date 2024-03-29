import { ActivationRecord } from "../model-AR";
import { ModelType } from "../../cmdl-types";
import { BaseModel } from "./base-model";

/**
 * Model for reference groups. Tablulates child properties and merges into parent AR.
 * TODO: copy properties directly to model AR?
 */
export class ReferenceGroupModel extends BaseModel {
  private path: string[];
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.REFERENCE_GROUP,
    path: string[] = []
  ) {
    super(name, modelAR, type);
    this.path = path;
  }

  public execute(globalAR: ActivationRecord): void {
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
