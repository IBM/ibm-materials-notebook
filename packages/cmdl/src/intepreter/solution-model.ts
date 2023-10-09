import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "@ibm-materials/cmdl-types";
import { SolutionModel } from "./models";

export class Solution extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.SOLUTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const chemicals =
        this.modelAR.getValue<TYPES.ChemicalReference[]>("references");
      const solutionModel = new SolutionModel(this.name, this.type);
      solutionModel.insertChemicals(chemicals, globalAR);

      globalAR.setValue(this.name, solutionModel);
    } catch (error) {
      throw new Error(
        `An error occured during executing solution model ${this.name}: ${error}`
      );
    }
  }
}
