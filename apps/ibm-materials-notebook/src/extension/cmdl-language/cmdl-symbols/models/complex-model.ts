import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

export class Complex extends BaseModel {
  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }
  execute(globalAR: ModelActivationRecord): void {
    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
    };
    for (const [name, value] of this.modelAR.all()) {
      if (name === "components") {
        let updatedComponents = value.map((item: any) => {
          let compRef = globalAR.getValue(item.name);
          return {
            ...compRef,
            ratio: item.ratio,
          };
        });
        properties[name] = updatedComponents;
      } else {
        properties[name] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
