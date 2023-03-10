import { ModelActivationRecord } from "./model-AR";
import {
  ChemicalConfig,
  ChemStates,
  NamedQuantity,
} from "../chemicals/chemical-factory";
import { GROUPS, ModelType } from "../../cmdl-types/groups/group-types";
import { PROPERTIES } from "../../cmdl-types";
import { CMDLUnit, CMDLUnitless } from "../symbol-types";
import Big from "big.js";
import { CMDLChemicalReference } from "./solution-model";

type QuantityNames =
  | PROPERTIES.MASS
  | PROPERTIES.VOLUME
  | PROPERTIES.MOLES
  | PROPERTIES.PRESSURE;

export type CMDLChemical = {
  name: string;
  type: ModelType.CHEMICAL;
  [PROPERTIES.INCHI_KEY]?: string;
  [PROPERTIES.INCHI]?: string;
  [PROPERTIES.MOL_WEIGHT]: CMDLUnit;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.DENSITY]?: CMDLUnit;
  [PROPERTIES.STATE]: ChemStates;
};

export type CMDLFragment = {
  name: string;
  type: ModelType.FRAGMENT;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.MOL_WEIGHT]: CMDLUnit;
};

export type CMDLPolymer = {
  name: string;
  type: ModelType.POLYMER;
  [PROPERTIES.MN_AVG]: CMDLUnit;
  [PROPERTIES.BIG_SMILES]?: string;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.MW_AVG]?: CMDLUnit;
  [PROPERTIES.DISPERSITY]?: CMDLUnitless;
  [PROPERTIES.STATE]: ChemStates;
  [PROPERTIES.TREE]: any;
};

export abstract class BaseModel {
  constructor(
    public name: string,
    public modelAR: ModelActivationRecord,
    public type: ModelType
  ) {}

  /**
   * Method to execute model for computation or tabulation of properties.
   * Writes values to parent activation record.
   * @param globalAR ModelActivationRecord
   */
  abstract execute(globalAR: ModelActivationRecord): void;

  /**
   * Transforms parsed reagents into chemical configs for computations
   * @param chemicals ChemicalReference[]
   * @param globalAR ModelActivationRecord
   */
  protected createChemicalConfigs(
    chemicals: CMDLChemicalReference[],
    globalAR: ModelActivationRecord,
    params?: { volume?: CMDLUnit; temperature?: CMDLUnit }
  ): ChemicalConfig[] {
    let configs: ChemicalConfig[] = [];

    for (const chemical of chemicals) {
      let parentValues = globalAR.getValue<CMDLChemical | CMDLPolymer>(
        chemical.name
      );
      const quantity = this.extractQuantity(chemical);
      const mwValue = this.getMw(parentValues);

      const chemicalConfig: ChemicalConfig = {
        name: chemical.name,
        mw: mwValue,
        smiles: parentValues.smiles,
        density:
          "density" in parentValues && parentValues?.density
            ? Big(parentValues.density.value)
            : null,
        state: parentValues.state,
        roles: chemical.roles,
        temperature: params?.temperature
          ? {
              value: Big(params.temperature.value),
              unit: params.temperature.unit,
              uncertainty: params.temperature?.uncertainty
                ? Big(params.temperature.uncertainty)
                : null,
            }
          : undefined,
        volume: params?.volume
          ? {
              value: Big(params.volume.value),
              unit: params.volume.unit,
              uncertainty: params.volume?.uncertainty
                ? Big(params.volume.uncertainty)
                : null,
            }
          : undefined,
        limiting: chemical?.limiting ? true : false,
        quantity,
      };

      if (
        chemicalConfig.state === ChemStates.LIQUID &&
        !chemicalConfig.density &&
        chemicalConfig.quantity.name === PROPERTIES.VOLUME
      ) {
        throw new Error(
          `Liquid chemical: ${this.name} has invalid density and a volume quantity`
        );
      }

      if (
        chemicalConfig.state === ChemStates.GAS &&
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

  private getMw(chemical: CMDLChemical | CMDLPolymer) {
    if (chemical.type === ModelType.CHEMICAL) {
      return chemical.molecular_weight.value;
    } else {
      if (chemical?.mn_avg && !Array.isArray(chemical.mn_avg)) {
        return chemical.mn_avg.value;
      } else if (chemical?.mn_avg && Array.isArray(chemical.mn_avg)) {
        if (chemical.mn_avg.length === 0) {
          return chemical.mn_avg[0].value;
        } else {
          let nmrMn = chemical.mn_avg.filter(
            (el: any) => el.technique === GROUPS.NMR
          );
          let gpcMn = chemical.mn_avg.filter(
            (el: any) => el.technique === GROUPS.GPC
          );

          if (nmrMn.length) {
            return nmrMn[0].value;
          } else if (gpcMn.length) {
            return gpcMn[0].value;
          } else {
            throw new Error(`unable to find valid Mn for ${chemical.name}`);
          }
        }
      }
    }
  }

  private extractQuantity(ref: CMDLChemicalReference): NamedQuantity {
    let name: QuantityNames;
    if (ref?.mass) {
      return {
        name: PROPERTIES.MASS,
        value: Big(ref.mass.value),
        unit: ref.mass.unit,
        uncertainty: ref.mass?.uncertainty ? Big(ref.mass.uncertainty) : null,
      };
    } else if (ref?.volume) {
      return {
        name: PROPERTIES.VOLUME,
        value: Big(ref.volume.value),
        unit: ref.volume.unit,
        uncertainty: ref.volume?.uncertainty
          ? Big(ref.volume.uncertainty)
          : null,
      };
    } else if (ref?.moles) {
      return {
        name: PROPERTIES.MOLES,
        value: Big(ref.moles.value),
        unit: ref.moles.unit,
        uncertainty: ref.moles?.uncertainty ? Big(ref.moles.uncertainty) : null,
      };
    } else if (ref?.pressure) {
      return {
        name: PROPERTIES.PRESSURE,
        value: Big(ref.pressure.value),
        unit: ref.pressure.unit,
        uncertainty: ref.pressure?.uncertainty
          ? Big(ref.pressure.uncertainty)
          : null,
      };
    } else {
      throw new Error(`Quantity is unavailable for ${ref.name}!`);
    }
  }
}
