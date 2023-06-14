import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, PROPERTIES, CMDL } from "cmdl-types";

export class Complex extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.COMPLEX
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
    };
    for (const [name, value] of this.modelAR.all()) {
      if (name === PROPERTIES.COMPONENTS) {
        let updatedComponents = (value as CMDL.ComplexReference[]).map(
          (item: CMDL.ComplexReference) => {
            let compRef = globalAR.getValue<CMDL.Chemical | CMDL.Polymer>(
              item.name
            );
            return {
              ...compRef,
              ratio: item.ratio,
            };
          }
        );
        properties[name] = updatedComponents;
      } else {
        properties[name] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
