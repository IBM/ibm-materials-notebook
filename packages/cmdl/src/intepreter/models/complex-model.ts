import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { ComplexEntity } from "../entities";
import { ModelType, TYPES } from "../../cmdl-types";

export class Complex extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.COMPLEX
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    const complexModel = new ComplexEntity(this.name, this.type);
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
