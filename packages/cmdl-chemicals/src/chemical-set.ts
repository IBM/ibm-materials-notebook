import { BaseChemical, ChemPropKey } from "./base-chemical";
import { UnitOperator, Unit } from "cmdl-units";
import ChemicalFactory from "./chemical-factory";
import Big from "big.js";
import { TAGS, TYPES } from "cmdl-types";

/**
 * Class for managing sets of chemicals in a solution or reaction
 */
export default class ChemicalSet {
  private chemicalFactory = new ChemicalFactory();
  private chemicalMap = new Map<string, BaseChemical>();
  private limiting: BaseChemical | null = null;
  private hasSolvent: boolean = false;
  private totalSolventVolume: TYPES.BigQty | null = null;
  private totalSolventMass: TYPES.BigQty | null = null;
  private totalReactionVolume: TYPES.BigQty | null = null;

  /**
   * Retrieves chemicals from chemical set
   */
  get chemicals(): BaseChemical[] {
    return [...this.chemicalMap.values()];
  }

  /**
   * Retrieves output values of chemicals in the chemical set
   */
  get chemicalValues(): TYPES.ChemicalOutput[] {
    return this.chemicals.map((item) => item.getValues());
  }

  /**
   * Inserts a chemical into the chemical set
   * @param chem TYPES.ChemicalConfig
   */
  public insert(chem: TYPES.ChemicalConfig): void {
    let chemical = this.chemicalFactory.create(chem);
    this.merge(chemical);
  }

  /**
   * Inserts an array of chemicals into the current chemical set
   * @param chemicals TYPES.ChemicalConfig[]
   */
  public insertMany(chemicals: TYPES.ChemicalConfig[]): void {
    for (const chemConfig of chemicals) {
      let chemical = this.chemicalFactory.create(chemConfig);
      this.merge(chemical);
    }
  }

  /**
   * Merges chemical with current chemical set.
   * If chemical already exists in chemical set, the moles of each chemical are combined
   * @param chemical BaseChemical
   */
  public merge(chemical: BaseChemical) {
    if (chemical.limiting) {
      this.limiting = chemical;
    }

    if (chemical.roles.includes(TAGS.SOLVENT)) {
      this.hasSolvent = true;
    }

    if (this.chemicalMap.has(chemical.name)) {
      let chemObj = this.chemicalMap.get(chemical.name);
      chemObj?.merge(chemical);
    } else {
      this.chemicalMap.set(chemical.name, chemical);
    }
  }

  /**
   * Computes quantity values, concentrations, and stochiometry for a chemical set
   * @returns TYPES.ChemicalOutput[]
   */
  public computeChemicalValues(): TYPES.ChemicalOutput[] {
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

  /**
   * Computes quantity values, concentrations, and stochiometry for a chemical set
   * @returns BaseChemical[]
   */
  public computeSetValues(): BaseChemical[] {
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

  /**
   * Compute ratios for each chemical within a chemical set
   */
  private computeRelativeRatios(): void {
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

  /**
   * Computes total volume of solvents in a chemical set
   */
  private computeTotalSolventVolume(): void {
    try {
      const solventUnitArray = this.chemicals
        .filter((item) => item.roles.includes(TAGS.SOLVENT))
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

  /**
   * Computes total solvent mass for a chemical set
   */
  private computeTotalSolventMass(): void {
    try {
      const solventUnitArray = this.chemicals
        .filter((item) => item.roles.includes(TAGS.SOLVENT))
        .map((el) => {
          let unit = new Unit(el.getProperty(ChemPropKey.MASS));
          return unit;
        });
      this.totalSolventMass = UnitOperator.sum(solventUnitArray, "k");
    } catch (error) {
      throw new Error(`Unable to compute total solvent mass: \n-${error}`);
    }
  }

  /**
   * Computes total volume for an entire chemical set.
   * Solid volumes are estimated a 1 g/ml.
   */
  private computeTotalReactionVolume(): void {
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

  /**
   * Computes all volume quantities for a chemical set
   */
  private computeVolumes(): void {
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
  public getMolesByVolume(volume: TYPES.BigQty): TYPES.ChemicalConfig[] {
    const configs: TYPES.ChemicalConfig[] = [];

    for (const chem of this.chemicalMap.values()) {
      let chemConfig = chem.getMolesByVolume(volume);
      configs.push(chemConfig);
    }

    return configs;
  }

  /**
   * Exports current chemical set to corresponding chemical configs
   */
  public exportSet(): TYPES.ChemicalConfig[] {
    const configs: TYPES.ChemicalConfig[] = [];

    for (const chem of this.chemicalMap.values()) {
      let chemConfig = chem.export();
      configs.push(chemConfig);
    }

    return configs;
  }

  /**
   * Iterates through all chemicals and computes three different concentration values
   * for the chemical within the current chemical set
   */
  private updateConcentrations(): void {
    this.chemicals.forEach((item) => {
      item.computeConcentration(this.totalReactionVolume, "molarity");
      item.computeConcentration(this.totalSolventMass, "molality");
      item.computeConcentration(this.totalSolventVolume, "moles_vol");
    });
  }
}
