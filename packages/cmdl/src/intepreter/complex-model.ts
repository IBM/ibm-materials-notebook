import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ComplexModel } from "./models";
import { ModelType, TYPES } from "cmdl-types";

export class Complex extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.COMPLEX
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const complexModel = new ComplexModel(this.name, this.type);
    for (const [name, value] of this.modelAR.all()) {
      //!TODO: embed references to component models?
      complexModel.add(
        name as keyof TYPES.Complex,
        value as TYPES.Complex[keyof TYPES.Complex]
      );
    }

    globalAR.setValue(this.name, complexModel);
  }
}
