import { Quantity } from "../symbol-types";
import { ChemicalSet } from "../chemicals";
import { ChemicalConfig } from "../chemicals/chemical-factory";

export class ReactorChemicals {
  private solution = new ChemicalSet();

  constructor(public flowRate: Quantity) {}

  setChemicals(chemicals: ChemicalConfig[]) {
    this.solution.insertMany(chemicals);
  }

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

  computeInitialValues() {
    this.solution.computeChemicalValues();
  }

  computeValues() {
    return this.solution.computeChemicalValues();
  }
}
