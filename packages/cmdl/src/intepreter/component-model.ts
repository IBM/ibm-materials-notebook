import { ModelActivationRecord } from "./model-AR";
import { ModelType } from "cmdl-types";
import { BaseModel } from "./base-model";

//merge with reference group

/**
 * Model for various named sub-groups. Tablulates child data and writes to current AR.
 */
export class ComponentModel extends BaseModel {
  constructor(name: string, modelAR: ModelActivationRecord, type: ModelType) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const type =
      this.type === ModelType.CHAR_DATA ? this.modelAR.name : this.type;
    const properties: Record<string, unknown> = {
      name: this.name,
      type: type,
    };

    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    globalAR.mergeArrayValue("components", properties);
    // if (
    //   globalAR.type === ModelType.REACTOR_GRAPH ||
    //   globalAR.type === ModelType.REACTOR
    // ) {
    //   globalAR.mergeArrayValue("nodes", properties);
    // } else if (
    //   globalAR.type === ModelType.POLYMER_GRAPH ||
    //   globalAR.type === ModelType.CONTAINER
    // ) {
    //   globalAR.mergeArrayValue("containers", properties);
    // } else {
    //   globalAR.setValue(this.name, properties);
    // }
  }
}
