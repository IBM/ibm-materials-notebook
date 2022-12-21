import { ChemicalSet } from "../chemicals";
import { cmdlLogger as logger } from "../../logger";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

export class Solution extends BaseModel {
  private solution = new ChemicalSet();

  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }

  execute(globalAR: ModelActivationRecord): void {
    try {
      const chemicals = this.modelAR.getValue("chemicals");
      let chemConfigs = this.createChemicalConfigs(chemicals, globalAR);
      logger.debug(`chemicals for solution ${this.name}`, { meta: chemicals });

      this.solution.insertMany(chemConfigs);

      let output = this.solution.computeChemicalValues();
      let configs = this.solution.exportSet();

      const solutionOutput = {
        name: this.name,
        type: this.type,
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
