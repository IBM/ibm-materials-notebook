import Big from "big.js";
import { typeManager } from "../../cmdl-types";
import { Quantity } from "../symbol-types";
import { BaseChemical, ChemPropKey } from "./base-chemical";
import { ChemicalConfig, ChemStates, NamedQuantity } from "./chemical-factory";

export default class Solid extends BaseChemical {
  constructor(
    name: string,
    roles: string[],
    mw: Big,
    limiting: boolean,
    smiles?: string
  ) {
    super(name, roles, limiting, smiles);
    this.mw = mw;
  }

  public computeValues(qty: NamedQuantity) {
    if (!this.mw) {
      throw new Error(`Missing or invalid mw for ${this.name}`);
    }

    let moleUnit: string, massUnit: string, volUnit: string;
    switch (qty.name) {
      case ChemPropKey.MASS:
        moleUnit = typeManager.getMolToMass(qty.unit);
        volUnit = typeManager.getVolToMass(qty.unit);
        this.moles = {
          value: qty.value.div(this.mw),
          unit: moleUnit,
          uncertainty: null,
        };
        this.mass = {
          value: qty.value,
          unit: qty.unit,
          uncertainty: null,
        };
        this.solidVol = { unit: volUnit, value: qty.value, uncertainty: null };
        break;
      case ChemPropKey.MOLES:
        massUnit = typeManager.getMolToMass(qty.unit);
        volUnit = typeManager.getVolToMass(massUnit);
        let massValue = qty.value.times(this.mw);
        this.mass = {
          value: massValue,
          unit: massUnit,
          uncertainty: null,
        };
        this.moles = {
          value: qty.value,
          unit: qty.unit,
          uncertainty: null,
        };
        this.solidVol = { unit: volUnit, value: massValue, uncertainty: null };
        break;
      default:
        throw new Error(`Invalid quantity type for ${this.name}: ${qty.name}`);
    }
  }

  merge(chemical: BaseChemical): void {
    const newMoles = this.combineMoles(chemical);
    this.computeValues({ name: ChemPropKey.MOLES, ...newMoles });
  }

  getMolesByVolume(volume: Quantity): ChemicalConfig {
    if (!this.mw) {
      throw new Error(`\n-Mw is invalid for ${this.name}`);
    }

    const newMoles = this.computeMolsFromMolarity(volume);

    if (!newMoles) {
      throw new Error(`\n-Error during computing final moles: ${this.name}`);
    }

    return {
      mw: this.mw,
      density: this.density,
      name: this.name,
      smiles: this.smiles,
      quantity: {
        name: ChemPropKey.MOLES,
        unit: newMoles.unit,
        value: newMoles.value,
        uncertainty: null,
      },
      roles: this.roles,
      state: ChemStates.SOLID,
      limiting: this.limiting,
    };
  }

  export(): ChemicalConfig {
    if (!this.mw || !this.moles) {
      throw new Error(`Cannot export incomplete solid chemical ${this.name}`);
    }

    return {
      mw: this.mw,
      density: this.density,
      name: this.name,
      smiles: this.smiles,
      quantity: {
        name: ChemPropKey.MOLES,
        unit: this.moles.unit,
        value: this.moles.value,
        uncertainty: null,
      },
      roles: this.roles,
      state: ChemStates.SOLID,
      limiting: this.limiting,
    };
  }
}
