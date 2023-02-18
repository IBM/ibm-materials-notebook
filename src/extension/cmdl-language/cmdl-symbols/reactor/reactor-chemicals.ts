import { Quantity } from "../symbol-types";
import { ChemicalSet } from "../chemicals";
import { ChemicalConfig } from "../chemicals/chemical-factory";

/**
 * Class for managing a set of chemicals in a continous-flow reactor
 */
export class ReactorChemicals {
  private solution = new ChemicalSet();

  constructor(public flowRate: Quantity) {}

  /**
   * Adds chemicals to the solution property
   * @param chemicals ChemicalConfig[]
   */
  setChemicals(chemicals: ChemicalConfig[]) {
    this.solution.insertMany(chemicals);
  }

  /**
   * Returns chemicals configs based on fraction of volume within a flow reactor
   * @param totalFlowRate Quantity - total flow rate within a reactor segment
   * @param totalVolume Quantity - total volume within a reactor segment
   * @returns ChemicalConfig
   */
  getByVolume(totalFlowRate: Quantity, totalVolume: Quantity) {
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
  computeInitialValues() {
    this.solution.computeChemicalValues();
  }

  /**
   * Computes stoichiometry for output the chemicals
   * @returns ChemicalOutput[]
   */
  computeValues() {
    return this.solution.computeChemicalValues();
  }
}
