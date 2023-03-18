import { ModelActivationRecord } from "./model-AR";
import { ModelType } from "../../cmdl-types/groups/group-types";
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

  //TODO: enable specific formating for result ouptuts
  public execute(globalAR: ModelActivationRecord): void {
    const properties: Record<string, any> = {
      name: this.name.slice(1),
      path: this.path,
    };
    for (const [name, value] of this.modelAR.all()) {
      properties[name] = value;
    }

    if (
      globalAR.type === ModelType.REACTION ||
      globalAR.type === ModelType.SOLUTION
    ) {
      globalAR.mergeArrayValue("chemicals", properties);
    } else if (globalAR.type === ModelType.FLOW_REACTION) {
      if ("roles" in properties) {
        globalAR.mergeArrayValue("products", properties);
      } else {
        globalAR.mergeArrayValue("solutions", properties);
      }
    } else if (globalAR.type === ModelType.CHAR_DATA) {
      globalAR.mergeArrayValue("references", properties);
    } else if (globalAR.type === ModelType.POLYMER) {
      globalAR.mergeArrayValue("treeValues", properties);
    } else if (globalAR.type === ModelType.COMPLEX) {
      globalAR.mergeArrayValue("components", properties);
    } else {
      globalAR.setValue(this.name, properties);
    }
  }
}
