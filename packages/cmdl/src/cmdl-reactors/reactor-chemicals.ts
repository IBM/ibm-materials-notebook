import { ChemicalSet } from "../cmdl-chemicals";
import { TYPES } from "../cmdl-types";

/**
 * Class for managing a set of chemicals in a continous-flow reactor
 */
export class ReactorChemicals {
  private solution = new ChemicalSet();
  public flowRate: TYPES.BigQty;

  constructor(chemicals: TYPES.ChemicalConfig[], flowRate: TYPES.BigQty) {
    this.solution.insertMany(chemicals);
    this.flowRate = flowRate;
  }

  /**
   * Adds chemicals to the solution property
   * @param chemicals ChemicalConfig[]
   * @deprecated
   */
  public setChemicals(chemicals: TYPES.ChemicalConfig[]): void {
    this.solution.insertMany(chemicals);
  }

  /**
   * Returns chemical configs based on fraction of volume within a flow reactor
   * @param totalFlowRate TYPES.BigQty - total flow rate within a reactor segment
   * @param totalVolume TYPES.BigQty - total volume within a reactor segment
   * @returns ChemicalConfig[]
   */
  public getByVolume(
    totalFlowRate: TYPES.BigQty,
    totalVolume: TYPES.BigQty
  ): TYPES.ChemicalConfig[] {
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
  public computeValues(): TYPES.ChemicalOutput[] {
    return this.solution.computeChemicalValues();
  }
}
