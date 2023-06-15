import { logger } from "../logger";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { ChemicalSet } from "cmdl-chemicals";

export class Solution extends BaseModel {
  private solution = new ChemicalSet();

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
        this.modelAR.getValue<TYPES.ChemicalReference[]>("chemicals");
      let chemConfigs = this.createChemicalConfigs(chemicals, globalAR);
      logger.debug(`chemicals for solution ${this.name}`, { meta: chemicals });

      this.solution.insertMany(chemConfigs);

      let output = this.solution.computeChemicalValues();
      let configs = this.solution.exportSet();

      const solutionOutput: TYPES.Solution = {
        name: this.name,
        type: ModelType.SOLUTION,
        components: output,
        componentConfigs: configs,
      };

      globalAR.setValue(this.name, solutionOutput);
    } catch (error) {
      throw new Error(
        `An error occured during executing solution model ${this.name}: ${error}`
      );
    }
  }
}
