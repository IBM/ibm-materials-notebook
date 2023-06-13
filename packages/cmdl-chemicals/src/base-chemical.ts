import { Unit, Quantity, handleRounding } from "cmdl-units";
import Big from "big.js";
import { UNITS, ReactionRoles } from "cmdl-types";
import { ChemicalConfig, ChemicalOutput } from "./chemical-factory";
import { NamedQuantity } from "./chemical-factory";

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

/**
 * Base class for chemicals within CMDL
 */
export abstract class BaseChemical {
  name: string;
  mw: Big | null = null;
  density: Big | null = null;
  smiles?: string;
  roles: ReactionRoles[];
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
    roles: ReactionRoles[],
    limiting: boolean,
    smiles?: string
  ) {
    this.name = name;
    this.roles = roles;
    this.limiting = limiting;
    this.smiles = smiles;
  }

  /**
   * Computes missing values (mass, volume, moles...etc) for a given chemical
   * @param qty NamedQuantity
   */
  abstract computeValues(qty: NamedQuantity): void;

  /**
   * Merge identical chemicals in a chemical set
   * @param chemical BaseChemical
   */
  abstract merge(chemical: BaseChemical): void;

  /**
   * Compute moles of a given chemical in a reaction based on a volume
   * @param volume Quantity
   */
  abstract getMolesByVolume(volume: Quantity): ChemicalConfig;

  /**
   * Exports a chemical as a ChemicalConfig
   */
  abstract export(): ChemicalConfig;

  /**
   * Sets whether or not the chemical is limiting in a reaction
   */
  public setLimiting(): void {
    this.limiting = true;
  }

  /**
   * Retrieves property of chemical based on a key
   * @param prop ChemPropKey
   * @returns Quantity
   */
  public getProperty(prop: ChemPropKey): Quantity {
    let value = this[prop];

    if (!value) {
      throw new Error(`Invalid property: ${prop}`);
    }
    return value;
  }

  /**
   * Computes the ratio of this chemical in a reaction based on the limiting reagent moles
   * @param limitingValue Big
   */
  public computeRatio(limitingValue: Big): void {
    if (!this.moles) {
      throw new Error(`Cannot compute ratio with invalid moles: ${this.moles}`);
    }
    const scaledMoles = new Unit(this.moles);
    scaledMoles.scaleTo("base");
    this.ratio = Big(scaledMoles.value).div(limitingValue);
  }

  /**
   * Computes the concentration of this chemical in a reaction
   * @param totalQty Quantity | null
   * @param type "molarity" | "molality" | "moles_vol"
   * @returns
   */
  public computeConcentration(
    totalQty: Quantity | null,
    type: "molarity" | "molality" | "moles_vol"
  ): void {
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

  /**
   * Computes moles of a chemical based on current concentration and a new volume amount
   * @param newVolume Quantity
   * @returns Quantity
   */
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

  /**
   * Combines two identical chemicals based on their moles value
   * @param chemical BaseChemical
   * @returns Quantity
   */
  protected combineMoles(chemical: BaseChemical): Quantity {
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

  /**
   * Retrieves output of the chemical
   * @returns ChemicalOutput
   */
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
