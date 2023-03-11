import { ChemicalSet } from "../chemicals";
import { cmdlLogger as logger } from "../../logger";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PROPERTIES, ReactionRoles } from "../../cmdl-types";
import { CMDLRef, CMDLUnit } from "../symbol-types";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { ChemicalConfig, ChemicalOutput } from "../chemicals/chemical-factory";

/**
 * Reference to any chemical entity in CMDL within a reaction or solution group
 */
export type CMDLChemicalReference = {
  name: string;
  path: string[];
  [PROPERTIES.MASS]?: CMDLUnit;
  [PROPERTIES.MOLES]?: CMDLUnit;
  [PROPERTIES.VOLUME]?: CMDLUnit;
  [PROPERTIES.PRESSURE]?: CMDLUnit;
  [PROPERTIES.ROLES]: ReactionRoles[];
  [PROPERTIES.LIMITING]?: boolean;
};

export type CMDLSolutionReference = {
  name: string;
  path: string[];
  [PROPERTIES.FLOW_RATE]: CMDLUnit;
  [PROPERTIES.INPUT]: CMDLRef;
};

/**
 * Solution entity within defined within CMDL
 */
export type CMDLSolution = {
  name: string;
  type: ModelType.SOLUTION;
  components: ChemicalOutput[];
  componentConfigs: ChemicalConfig[];
};

export type CMDLSolutionExport = Omit<CMDLSolution, "componentConfigs">;

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
        this.modelAR.getValue<CMDLChemicalReference[]>("chemicals");
      let chemConfigs = this.createChemicalConfigs(chemicals, globalAR);
      logger.debug(`chemicals for solution ${this.name}`, { meta: chemicals });

      this.solution.insertMany(chemConfigs);

      let output = this.solution.computeChemicalValues();
      let configs = this.solution.exportSet();

      const solutionOutput: CMDLSolution = {
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
