import { ModelActivationRecord } from "./model-AR";
import { cmdlLogger as logger } from "../../logger";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { BaseModel } from "./base-model";

/**
 * Model for various named sub-groups. Tablulates child data and writes to current AR.
 */
export class ComponentModel extends BaseModel {
  constructor(name: string, modelAR: ModelActivationRecord, type: ModelType) {
    super(name, modelAR, type);
  }

  execute(globalAR: ModelActivationRecord): void {
    const type =
      this.type === ModelType.CHAR_DATA ? this.modelAR.name : this.type;
    const properties: Record<string, any> = {
      name: this.name,
      type: type,
    };

    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    if (
      globalAR.type === ModelType.REACTOR_GRAPH ||
      globalAR.type === ModelType.REACTOR
    ) {
      globalAR.mergeArrayValue("nodes", properties);
    } else if (
      globalAR.type === ModelType.POLYMER_GRAPH ||
      globalAR.type === ModelType.CONTAINER
    ) {
      globalAR.mergeArrayValue("containers", properties);
    } else if (globalAR.type === ModelType.SAMPLE) {
      globalAR.mergeArrayValue("charData", properties);
    } else {
      globalAR.setValue(this.name, properties);
    }
  }
}
