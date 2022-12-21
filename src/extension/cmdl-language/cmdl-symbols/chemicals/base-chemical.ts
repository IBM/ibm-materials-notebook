import { Unit, QtyUnit } from "../units";
import Big from "big.js";
import { handleRounding } from "../../cmdl-tree/utils";
import { UNITS } from "../../cmdl-types/units";
import { Quantity } from "../units/unit-types";
import { ChemicalConfig, ChemicalOutput } from "./chemical-factory";
import { cmdlLogger } from "../../logger";

export enum ChemPropKey {
  MASS = "mass",
  VOLUME = "volume",
  MOLES = "moles",
  PRESSURE = "pressure",
  MOLARITY = "molarity",
  MOLALITY = "molality",
  MOLS_VOL = "moles_vol",
  SOLID_VOL = "solidVol",
}
export abstract class BaseChemical {
  name: string;
  mw: Big | null = null;
  density: Big | null = null;
  smiles?: string;
  roles: string[];
  ratio: Big | null = null;
  mass: Quantity | null = null;
  volume: Quantity | null = null;
  moles: Quantity | null = null;
  pressure: Quantity | null = null;
  molarity: Quantity | null = null;
  molality: Quantity | null = null;
  moles_vol: Quantity | null = null;
  solidVol: Quantity | null = null;
  limiting: boolean = false;

  constructor(
    name: string,
    roles: string[],
    limiting: boolean,
    smiles?: string
  ) {
    this.name = name;
    this.roles = roles;
    this.limiting = limiting;
    this.smiles = smiles;
  }

  abstract computeValues(qty: any): void;
  abstract merge(chemical: BaseChemical): void;
  abstract getMolesByVolume(volume: Quantity): ChemicalConfig;
  abstract export(): ChemicalConfig;

  setLimiting() {
    this.limiting = true;
  }

  getProperty(prop: ChemPropKey) {
    let value = this[prop];

    if (!value) {
      throw new Error(`Invalid property: ${prop}`);
    }
    return value;
  }

  computeRatio(limitingValue: Big) {
    if (!this.moles) {
      throw new Error(`Cannot compute ratio with invalid moles: ${this.moles}`);
    }
    const scaledMoles = new Unit(this.moles);
    scaledMoles.scaleTo("base");
    this.ratio = Big(scaledMoles.value).div(limitingValue);
  }

  computeConcentration(
    totalQty: QtyUnit | null,
    type: "molarity" | "molality" | "moles_vol"
  ) {
    if (!totalQty || !this.moles) {
      return;
    }

    const totalQtyUnit = new Unit(totalQty);
    const molUnit = new Unit(this.moles);

    molUnit.convertTo("mol");
    totalQtyUnit.invert();

    if (type === "molarity") {
      this.molarity = {
        unit: UNITS.MOL_L,
        value: Big(molUnit.value).times(totalQtyUnit.value),
        uncertainty: null,
      };
    } else if (type === "molality") {
      this.molality = {
        unit: UNITS.MOL_KG,
        value: Big(molUnit.value).times(totalQtyUnit.value),
        uncertainty: null,
      };
    } else if (type === "moles_vol") {
      this.moles_vol = {
        unit: UNITS.MOL_L,
        value: Big(molUnit.value).times(totalQtyUnit.value),
        uncertainty: null,
      };
    } else {
      throw new Error(`\n-Unhandled concentration type: ${type}`);
    }
  }

  protected computeMolsFromMolarity(newVolume: Quantity): Quantity {
    if (!this.molarity) {
      throw new Error(`\n-Unable to compute from molarity: ${this.name}`);
    }
    const volumeUnit = new Unit(newVolume);
    const originalPrefix = volumeUnit.getPrefix();

    if (!originalPrefix) {
      throw new Error(`\n-Invalid volume unit: ${newVolume.unit}`);
    }

    volumeUnit.scaleTo("base");

    const newMoles = Big(volumeUnit.value).times(this.molarity.value);

    const finalMoles = new Unit({
      unit: UNITS.MOL,
      value: newMoles,
      uncertainty: null,
    });

    finalMoles.scaleTo(originalPrefix);
    return { ...finalMoles.output(), uncertainty: null };
  }

  protected combineMoles(chemical: BaseChemical): QtyUnit {
    if (this.name !== chemical.name) {
      throw new Error(`\n-Cannot merge two different chemicals`);
    }

    if (!this.moles?.unit || !chemical.moles?.unit) {
      throw new Error(`\n-Cannot merge chemicals without moles`);
    }

    let newValue: Big;

    if (this.moles.unit !== chemical.moles.unit) {
      let chemicalMoles = new Unit(chemical.moles);
      chemicalMoles.convertTo(this.moles.unit);
      newValue = this.moles.value.plus(chemicalMoles._value);
    } else {
      newValue = this.moles.value.plus(chemical.moles.value);
    }

    return { value: newValue, unit: this.moles.unit, uncertainty: null };
  }

  public getValues(): ChemicalOutput {
    let returnValue = {
      name: this.name,
      mw: this.mw ? this.mw : null,
      density: this.density ? this.density : null,
      smiles: this.smiles ? this.smiles : null,
      mass: handleRounding(this.mass, true),
      volume: this.volume ? handleRounding(this.volume, true) : this.volume,
      moles: handleRounding(this.moles, true),
      pressure: this.pressure ? handleRounding(this.pressure) : this.pressure,
      ratio: this.ratio ? this.ratio.round(2).toNumber() : null,
      roles: this.roles,
      molarity: handleRounding(this.molarity),
      molality: handleRounding(this.molality),
      moles_vol: handleRounding(this.moles_vol),
      limiting: this.limiting,
    };
    return returnValue;
  }
}
