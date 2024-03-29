import { Unit } from "../cmdl-units";
import Big from "big.js";
import { BaseChemical } from "./base-chemical";
import { UNITS, PROPERTIES, ReactionRoles, TYPES } from "../cmdl-types";

/**
 * Class representing gaseous chemicals in a reaction
 */
export default class Gas extends BaseChemical {
  constructor(
    name: string,
    roles: ReactionRoles[],
    mw: Big,
    limiting: boolean
  ) {
    super(name, roles, limiting);
    this.mw = mw;
  }

  /**
   * Initializes gas values based on pressure and reactor volume
   * @param volume TYPES.BigQty
   * @param pressure TYPES.BigQty
   */
  public initializeValues(volume: TYPES.BigQty, pressure: TYPES.BigQty) {
    if (pressure && pressure.unit !== "atm") {
      const pressureUnit = new Unit(pressure);
      pressureUnit.changeUnitBase("atm");
      this.pressure = { ...pressureUnit.output(), uncertainty: null };
    } else {
      this.pressure = pressure;
    }

    if (volume && volume.unit !== "l") {
      const volUnit = new Unit(volume);
      volUnit.scaleTo("base");
      this.volume = { ...volUnit.output(), uncertainty: null };
    } else {
      this.volume = volume;
    }
  }

  public computeValues(temp: TYPES.BigQty) {
    if (!this.pressure || !this.volume || !this.mw) {
      throw new Error(`Incomplete data to compute gas values in ${this.name}`);
    }

    if (temp.unit !== UNITS.DEGK) {
      temp.value = temp.value.plus(273.15);
      temp.unit = UNITS.DEGK;
    }

    const PV = Big(this.pressure.value).times(this.volume.value);
    const RT = Big(0.08205).times(temp.value);
    const moles = PV.div(RT);
    const mass = moles.times(this.mw);
    this.moles = { unit: "mol", value: moles, uncertainty: null };
    this.mass = { unit: "g", value: mass, uncertainty: null };
  }

  public merge(chemical: BaseChemical): void {
    throw new Error(`Cannot merge for gaseous reagents`);
  }

  public getMolesByVolume(volume: TYPES.BigQty): TYPES.ChemicalConfig {
    throw new Error(`Not implmented for gaseous reagents`);
  }

  public export(): TYPES.ChemicalConfig {
    if (!this.mw || !this.pressure || !this.volume) {
      throw new Error(`Cannot export incomplete gas chemical ${this.name}`);
    }

    return {
      mw: this.mw,
      density: this.density,
      name: this.name,
      quantity: {
        name: PROPERTIES.PRESSURE,
        unit: this.pressure.unit,
        value: this.pressure.value,
        uncertainty: null,
      },
      roles: this.roles,
      state: TYPES.ChemStates.GAS,
      limiting: this.limiting,
    };
  }
}
