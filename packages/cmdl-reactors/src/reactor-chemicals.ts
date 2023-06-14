import { ChemicalSet } from "cmdl-chemicals";
import { CMDL } from "cmdl-types";

/**
 * Class for managing a set of chemicals in a continous-flow reactor
 */
export class ReactorChemicals {
  private solution = new ChemicalSet();
  public flowRate: CMDL.BigQty;

  constructor(flowRate: CMDL.BigQty) {
    this.flowRate = flowRate;
  }

  /**
   * Adds chemicals to the solution property
   * @param chemicals ChemicalConfig[]
   */
  public setChemicals(chemicals: CMDL.ChemicalConfig[]): void {
    this.solution.insertMany(chemicals);
  }

  /**
   * Returns chemical configs based on fraction of volume within a flow reactor
   * @param totalFlowRate CMDL.BigQty - total flow rate within a reactor segment
   * @param totalVolume CMDL.BigQty - total volume within a reactor segment
   * @returns ChemicalConfig[]
   */
  public getByVolume(
    totalFlowRate: CMDL.BigQty,
    totalVolume: CMDL.BigQty
  ): CMDL.ChemicalConfig[] {
    const volumeFraction = this.flowRate.value
      .div(totalFlowRate.value)
      .times(totalVolume.value)
      .round(8);

    return this.solution.getMolesByVolume({
      value: volumeFraction,
      unit: totalVolume.unit,
      uncertainty: null,
    });
  }

  /**
   * Computes initial stochiometry for the chemicals
   */
  public computeInitialValues(): void {
    this.solution.computeChemicalValues();
  }

  /**
   * Computes stoichiometry for output the chemicals
   * @returns ChemicalOutput[]
   */
  public computeValues(): CMDL.ChemicalOutput[] {
    return this.solution.computeChemicalValues();
  }
}
