import { CMDLUnit, Quantity } from "../symbol-types";
import { ChemicalSet } from "../chemicals";
import { ChemicalConfig } from "../chemicals/chemical-factory";
import Big from "big.js";

/**
 * Class for managing a set of chemicals in a continous-flow reactor
 */
export class ReactorChemicals {
  private solution = new ChemicalSet();
  public flowRate: Quantity;

  constructor(flowRate: Quantity | CMDLUnit) {
    if (this.isCMDLUnit(flowRate)) {
      this.flowRate = {
        unit: flowRate.unit,
        uncertainty: flowRate?.uncertainty ? Big(flowRate.uncertainty) : null,
        value: Big(flowRate.value),
      };
    } else {
      this.flowRate = flowRate;
    }
  }

  private isCMDLUnit(item: Quantity | CMDLUnit): item is CMDLUnit {
    return typeof item.value === "string";
  }

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
