import { typeManager } from "../../cmdl-types";
import { BaseChemical, ChemPropKey } from "./base-chemical";
import { ChemicalConfig, ChemStates, NamedQuantity } from "./chemical-factory";
import Big from "big.js";
import { QtyUnit } from "../units";

export default class Liquid extends BaseChemical {
  constructor(
    name: string,
    roles: string[],
    mw: Big,
    density: Big,
    limiting: boolean,
    smiles?: string
  ) {
    super(name, roles, limiting, smiles);
    this.mw = mw;
    this.density = density;
  }

  //TODO: Implement more rigorous operations with units
  computeValues(qty: NamedQuantity) {
    if (!this.mw) {
      throw new Error(
        `Missing or invalid mw value for ${this.name}: ${this.mw}`
      );
    }

    if (!this.density) {
      throw new Error(
        `Missing or invalid density value for ${this.name}: ${this.density}`
      );
    }

    let volumeUnit: string, moleUnit: string, massUnit: string;
    switch (qty.name) {
      case ChemPropKey.MASS:
        volumeUnit = typeManager.getVolToMass(qty.unit);
        moleUnit = typeManager.getMolToMass(qty.unit);
        this.mass = {
          value: qty.value,
          unit: qty.unit,
          uncertainty: qty.uncertainty,
        };
        this.volume = {
          value: qty.value.div(this.density),
          unit: volumeUnit,
          uncertainty: null,
        };
        this.moles = {
          value: qty.value.div(this.mw),
          unit: moleUnit,
          uncertainty: null,
        };
        break;
      case ChemPropKey.VOLUME:
        massUnit = typeManager.getVolToMass(qty.unit);
        moleUnit = typeManager.getMolToMass(massUnit);

        this.volume = {
          value: qty.value,
          unit: qty.unit,
          uncertainty: null,
        };
        this.mass = {
          value: qty.value.times(this.density),
          unit: massUnit,
          uncertainty: null,
        };
        this.moles = {
          value: qty.value.times(this.density).div(this.mw),
          unit: moleUnit,
          uncertainty: null,
        };
        break;
      case ChemPropKey.MOLES:
        massUnit = typeManager.getMolToMass(qty.unit);
        volumeUnit = typeManager.getVolToMass(massUnit);

        this.mass = {
          value: qty.value.times(this.mw),
          unit: massUnit,
          uncertainty: null,
        };
        this.volume = {
          value: qty.value.times(this.mw).div(this.density),
          unit: volumeUnit,
          uncertainty: null,
        };
        this.moles = {
          value: qty.value,
          unit: qty.unit,
          uncertainty: null,
        };
        break;
      default:
        throw new Error(
          `invalid quantity type for liquid ${this.name}: ${qty.name}`
        );
    }
  }

  merge(chemical: BaseChemical): void {
    const newMoles = this.combineMoles(chemical);
    this.computeValues({ name: ChemPropKey.MOLES, ...newMoles });
  }

  getMolesByVolume(volume: QtyUnit): ChemicalConfig {
    if (!this.mw) {
      throw new Error(`\n-Mw is invalid for ${this.name}`);
    }

    const newMoles = this.computeMolsFromMolarity(volume);

    if (!newMoles) {
      throw new Error(`\n-Error during computing final moles: ${this.name}`);
    }

    return {
      mw: this.mw,
      density: this.density ? this.density : null,
      name: this.name,
      smiles: this.smiles,
      quantity: {
        name: ChemPropKey.MOLES,
        unit: newMoles.unit,
        value: newMoles.value,
        uncertainty: null,
      },
      roles: this.roles,
      state: ChemStates.LIQUID,
      limiting: this.limiting,
    };
  }

  export(): ChemicalConfig {
    if (!this.mw || !this.density || !this.moles) {
      throw new Error(`Cannot export incomplete liquid chemical ${this.name}`);
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
      state: ChemStates.LIQUID,
      limiting: this.limiting,
    };
  }
}
