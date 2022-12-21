import { Unit } from "../units";
import Big from "big.js";
import { BaseChemical, ChemPropKey } from "./base-chemical";
import { Quantity } from "../units/unit-types";
import { UNITS } from "../../cmdl-types/units";
import { ChemicalConfig, ChemStates } from "./chemical-factory";

export default class Gas extends BaseChemical {
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

  public initializeValues(volume: Quantity, pressure: Quantity) {
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

  public computeValues(temp: Quantity) {
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

  merge(chemical: BaseChemical): void {
    throw new Error(`Cannot merge for gaseous reagents`);
  }

  getMolesByVolume(volume: Quantity): ChemicalConfig {
    throw new Error(`Not implmented for gaseous reagents`);
  }

  export(): ChemicalConfig {
    if (!this.mw || !this.pressure || !this.volume) {
      throw new Error(`Cannot export incomplete gas chemical ${this.name}`);
    }

    return {
      mw: this.mw,
      density: this.density,
      name: this.name,
      smiles: this.smiles,
      quantity: {
        name: ChemPropKey.PRESSURE,
        unit: this.pressure.unit,
        value: this.pressure.value,
        uncertainty: null,
      },
      roles: this.roles,
      state: ChemStates.GAS,
      limiting: this.limiting,
    };
  }
}
