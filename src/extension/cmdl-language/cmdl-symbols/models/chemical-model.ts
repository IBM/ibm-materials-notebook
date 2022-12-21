import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

/**
 * Model for chemicals and chemical fragments. Tabulates values and writes to parent AR.
 */
export class ChemicalModel extends BaseModel {
  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
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
