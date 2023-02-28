import { BaseChemical, ChemPropKey } from "./base-chemical";
import { UnitOperator, Unit } from "../units";
import ChemicalFactory, { ChemicalConfig } from "./chemical-factory";
import { Quantity } from "../symbol-types";
import Big from "big.js";

export default class ChemicalSet {
  private chemicalFactory = new ChemicalFactory();
  private chemicalMap = new Map<string, BaseChemical>();
  private limiting: BaseChemical | null = null;
  private hasSolvent: boolean = false;
  private totalSolventVolume: Quantity | null = null;
  private totalSolventMass: Quantity | null = null;
  private totalReactionVolume: Quantity | null = null;

  get chemicals() {
    return [...this.chemicalMap.values()];
  }

  get chemicalValues() {
    return this.chemicals.map((item) => item.getValues());
  }

  public insert(chem: ChemicalConfig) {
    let chemical = this.chemicalFactory.create(chem);
    this.merge(chemical);
  }

  public insertMany(chemicals: ChemicalConfig[]) {
    for (const chemConfig of chemicals) {
      let chemical = this.chemicalFactory.create(chemConfig);
      this.merge(chemical);
    }
  }

  public merge(chemical: BaseChemical) {
    if (chemical.limiting) {
      this.limiting = chemical;
    }

    if (chemical.roles.includes("solvent")) {
      this.hasSolvent = true;
    }

    if (this.chemicalMap.has(chemical.name)) {
      let chemObj = this.chemicalMap.get(chemical.name);
      chemObj?.merge(chemical);
    } else {
      this.chemicalMap.set(chemical.name, chemical);
    }
  }

  public computeChemicalValues() {
    try {
      if (![...this.chemicalMap.values()].length) {
        return [];
      }
      this.computeRelativeRatios();
      this.computeVolumes();
      this.updateConcentrations();
      return this.chemicalValues;
    } catch (error) {
      throw new Error(`Error during computing chemical values: \n-${error}`);
    }
  }

  public computeSetValues() {
    try {
      if (![...this.chemicalMap.values()].length) {
        return [];
      }
      this.computeRelativeRatios();
      this.computeVolumes();
      this.updateConcentrations();
      return this.chemicals;
    } catch (error) {
      throw new Error(`Error during computing chemical values: \n-${error}`);
    }
  }

  private computeRelativeRatios() {
    try {
      if (this.limiting) {
        let limitingMoles = new Unit(
          this.limiting.getProperty(ChemPropKey.MOLES)
        );
        limitingMoles.scaleTo("base");
        this.chemicals.forEach((el) => el.computeRatio(limitingMoles.value));
      } else {
        let curr = Infinity;

        const baseMoles = this.chemicals.map((el) => {
          let moles = el.getProperty(ChemPropKey.MOLES);
          let molesUnit = new Unit(moles);
          molesUnit.scaleTo("base");
          return molesUnit;
        });

        for (let i = 0; i < baseMoles.length; i++) {
          if (baseMoles[i].value.toNumber() < curr) {
            curr = baseMoles[i].value.toNumber();
          }
        }

        if (curr === Infinity) {
          throw new Error(`Unable to find a limiting value`);
        }

        this.chemicals.forEach((el) => el.computeRatio(Big(curr)));
      }
    } catch (error) {
      const errMsg = `Unable to compute relative ratios: \n-${error}`;
      console.warn(errMsg);
      throw new Error(errMsg);
    }
  }

  private computeTotalSolventVolume() {
    try {
      const solventUnitArray = this.chemicals
        .filter((item) => item.roles.includes("solvent"))
        .map((el) => {
          let volUnit: Unit;
          if (el.volume) {
            volUnit = new Unit(el.volume);
          } else {
            volUnit = new Unit(el.getProperty(ChemPropKey.SOLID_VOL));
          }
          return volUnit;
        });
      this.totalSolventVolume = UnitOperator.sum(solventUnitArray);
    } catch (error) {
      throw new Error(`Unable to compute total solvent volume: \n-${error}`);
    }
  }

  private computeTotalSolventMass() {
    try {
      const solventUnitArray = this.chemicals
        .filter((item) => item.roles.includes("solvent"))
        .map((el) => {
          let unit = new Unit(el.getProperty(ChemPropKey.MASS));
          return unit;
        });
      this.totalSolventMass = UnitOperator.sum(solventUnitArray, "k");
    } catch (error) {
      throw new Error(`Unable to compute total solvent mass: \n-${error}`);
    }
  }

  private computeTotalReactionVolume() {
    try {
      let totalUnitArray = this.chemicals.map((item) => {
        let volUnit: Unit;
        if (item.volume) {
          volUnit = new Unit(item.volume);
        } else {
          volUnit = new Unit(item.getProperty(ChemPropKey.SOLID_VOL));
        }
        return volUnit;
      });
      this.totalReactionVolume = UnitOperator.sum(totalUnitArray);
    } catch (error) {
      throw new Error(`Unable to compute total reaction volume: \n-${error}`);
    }
  }

  private computeVolumes() {
    try {
      if (this.hasSolvent) {
        this.computeTotalSolventMass();
        this.computeTotalSolventVolume();
      }
      this.computeTotalReactionVolume();
    } catch (error) {
      throw new Error(`Error during computing volumes: \n-${error}`);
    }
  }

  /**
   *
   * Returns a set of mole values from a solution based on a volume
   *
   */
  public getMolesByVolume(volume: Quantity): ChemicalConfig[] {
    const configs: ChemicalConfig[] = [];

    for (const chem of this.chemicalMap.values()) {
      let chemConfig = chem.getMolesByVolume(volume);
      configs.push(chemConfig);
    }

    return configs;
  }

  /**
   * Exports current chemical set to corresponding chemical configs
   */
  public exportSet(): ChemicalConfig[] {
    const configs: ChemicalConfig[] = [];

    for (const chem of this.chemicalMap.values()) {
      let chemConfig = chem.export();
      configs.push(chemConfig);
    }

    return configs;
  }

  private updateConcentrations() {
    this.chemicals.forEach((item) => {
      item.computeConcentration(this.totalReactionVolume, "molarity");
      item.computeConcentration(this.totalSolventMass, "molality");
      item.computeConcentration(this.totalSolventVolume, "moles_vol");
    });
  }
}
