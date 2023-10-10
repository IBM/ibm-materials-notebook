import { TYPES, PROPERTIES } from "@ibm-materials/cmdl-types";
import { ModelActivationRecord } from "../model-AR";
import { ChemicalEntity } from "./model";

export class ChemicalTranslator {
  /**
   * Method for examining the CMDLChemicalReference and determining the quantity type
   * for a chemical. Returns the quantity reformatted for stoichiometry calculations.
   * @param ref CMDLChemicalRefrerence
   * @returns NamedQuantity
   */
  static extractQuantity(ref: TYPES.ChemicalReference): TYPES.NamedQty {
    // let name: TYPES.QuantityNames;
    if (ref?.mass) {
      return {
        name: PROPERTIES.MASS,
        value: ref.mass.value,
        unit: ref.mass.unit,
        uncertainty: ref.mass.uncertainty,
      };
    } else if (ref?.volume) {
      return {
        name: PROPERTIES.VOLUME,
        value: ref.volume.value,
        unit: ref.volume.unit,
        uncertainty: ref.volume.uncertainty,
      };
    } else if (ref?.moles) {
      return {
        name: PROPERTIES.MOLES,
        value: ref.moles.value,
        unit: ref.moles.unit,
        uncertainty: ref.moles.uncertainty,
      };
    } else if (ref?.pressure) {
      return {
        name: PROPERTIES.PRESSURE,
        value: ref.pressure.value,
        unit: ref.pressure.unit,
        uncertainty: ref.pressure.uncertainty,
      };
    } else {
      throw new Error(`Quantity is unavailable for ${ref.name}!`);
    }
  }

  static createChemicalConfigs(
    chemicals: TYPES.ChemicalReference[],
    globalAR: ModelActivationRecord,
    params?: { volume?: TYPES.BigQty | null; temperature?: TYPES.BigQty | null }
  ): TYPES.ChemicalConfig[] {
    const configs: TYPES.ChemicalConfig[] = [];
    for (const chemical of chemicals) {
      const parentModel = globalAR.getValue<ChemicalEntity>(chemical.name);

      const quantity = this.extractQuantity(chemical);
      const configValues = parentModel.getConfigValues();

      const chemicalConfig: TYPES.ChemicalConfig = {
        name: chemical.name,
        mw: configValues.mw,
        density: configValues.density || null,
        state: configValues.state,
        roles: chemical.roles,
        temperature: params?.temperature || undefined,
        volume: params?.volume || undefined,
        limiting: chemical?.limiting ? true : false,
        quantity,
      };

      if (
        chemicalConfig.state === TYPES.ChemStates.LIQUID &&
        !chemicalConfig.density &&
        chemicalConfig.quantity.name === PROPERTIES.VOLUME
      ) {
        throw new Error(
          `Liquid chemical: ${this.name} has invalid density and a volume quantity`
        );
      }

      if (
        chemicalConfig.state === TYPES.ChemStates.GAS &&
        chemicalConfig.quantity.name !== PROPERTIES.PRESSURE
      ) {
        throw new Error(
          `Pressure should be used as a quantity for gas reagent ${this.name}`
        );
      }

      configs.push(chemicalConfig);
    }

    return configs;
  }
}
