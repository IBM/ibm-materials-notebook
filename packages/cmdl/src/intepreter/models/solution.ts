import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "../../cmdl-types";
import { SolutionEntity } from "../entities";

export class Solution extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.SOLUTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    try {
      const chemicals =
        this.modelAR.getValue<TYPES.ChemicalReference[]>("references");
      const solutionModel = new SolutionEntity(this.name, this.type);
      solutionModel.insertChemicals(chemicals, globalAR);

      globalAR.setValue(this.name, solutionModel);
    } catch (error) {
      throw new Error(
        `An error occured during executing solution model ${this.name}: ${error}`
      );
    }
  }
}
