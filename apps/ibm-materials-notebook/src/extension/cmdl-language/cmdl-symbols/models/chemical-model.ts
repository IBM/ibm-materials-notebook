import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType } from "../../cmdl-types/groups/group-types";

/**
 * Model for chemicals and chemical fragments. Tabulates values and writes to parent AR.
 */
export class ChemicalModel extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.CHEMICAL | ModelType.FRAGMENT
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
