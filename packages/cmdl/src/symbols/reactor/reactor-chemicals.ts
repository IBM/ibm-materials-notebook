import { CMDLUnit, Quantity } from "../symbol-types";
import { ChemicalSet } from "../chemicals";
import { ChemicalConfig, ChemicalOutput } from "../chemicals/chemical-factory";
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

  /**
   * Type predicate for determining unit type
   * @param item Quantity | CMDLUnit
   * @returns boolean
   */
  private isCMDLUnit(item: Quantity | CMDLUnit): item is CMDLUnit {
    return typeof item.value === "string";
  }

  /**
   * Adds chemicals to the solution property
   * @param chemicals ChemicalConfig[]
   */
  public setChemicals(chemicals: ChemicalConfig[]): void {
    this.solution.insertMany(chemicals);
  }

  /**
   * Returns chemical configs based on fraction of volume within a flow reactor
   * @param totalFlowRate Quantity - total flow rate within a reactor segment
   * @param totalVolume Quantity - total volume within a reactor segment
   * @returns ChemicalConfig[]
   */
  public getByVolume(
    totalFlowRate: Quantity,
    totalVolume: Quantity
  ): ChemicalConfig[] {
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
  public computeValues(): ChemicalOutput[] {
    return this.solution.computeChemicalValues();
  }
}
