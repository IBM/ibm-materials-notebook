import { ActivationRecord } from "../model-AR";
import { ModelType } from "@ibm-materials/cmdl-types";
import { BaseModel } from "./base-model";

/**
 * Model for various named sub-groups. Tablulates child data and writes to current AR.
 */
export class ComponentModel extends BaseModel {
  constructor(name: string, modelAR: ActivationRecord, type: ModelType) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    const properties: Record<string, unknown> = {
      name: this.name,
      type: this.type,
    };

    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    globalAR.mergeArrayValue("components", properties);
  }
}
