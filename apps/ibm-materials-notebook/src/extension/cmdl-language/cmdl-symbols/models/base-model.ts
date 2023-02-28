import { ModelActivationRecord } from "./model-AR";
import { ChemPropKey } from "../chemicals/base-chemical";
import {
  ChemicalConfig,
  ChemStates,
  NamedQuantity,
} from "../chemicals/chemical-factory";
import { ModelType } from "../../cmdl-types/groups/group-types";

export abstract class BaseModel {
  constructor(
    public name: string,
    public modelAR: ModelActivationRecord,
    public type: string
  ) {}

  /**
   * Method to execute model for computation or tabulation of properties.
   * Writes values to parent activation record.
   * @param globalAR ModelActivationRecord
   */
  abstract execute(globalAR: ModelActivationRecord): void;

  /**
   * Transforms parsed reagents into chemical configs for computations
   * @param chemicals Array<chem>
   * @param globalAR ModelActivationRecord
   */
  protected createChemicalConfigs(
    chemicals: any[],
    globalAR: ModelActivationRecord,
    params?: { volume?: any; temperature?: any }
  ): ChemicalConfig[] {
    let configs: ChemicalConfig[] = [];

    for (const chemical of chemicals) {
      let parentValues = globalAR.getValue(chemical.name);
      const quantity = this.extractQuantity(chemical);
      const mwValue = this.getMw(parentValues);

      const chemicalConfig: ChemicalConfig = {
        name: chemical.name,
        mw: mwValue,
        smiles: parentValues.smiles,
        density: parentValues?.density ? parentValues.density.value : null,
        state: parentValues.state,
        roles: chemical.roles,
        temperature: params?.temperature ? params.temperature : undefined,
        volume: params?.volume ? params.volume : undefined,
        limiting: chemical?.limiting ? true : false,
        quantity,
      };

      if (
        chemicalConfig.state === ChemStates.LIQUID &&
        !chemicalConfig.density &&
        chemicalConfig.quantity.name === ChemPropKey.VOLUME
      ) {
        throw new Error(
          `Liquid chemical: ${this.name} has invalid density and a volume quantity`
        );
      }

      if (
        chemicalConfig.state === ChemStates.GAS &&
        chemicalConfig.quantity.name !== ChemPropKey.PRESSURE
      ) {
        throw new Error(
          `Pressure should be used as a quantity for gas reagent ${this.name}`
        );
      }

      configs.push(chemicalConfig);
    }

    return configs;
  }

  private getMw(chemical: any) {
    if (chemical.type === ModelType.CHEMICAL) {
      return chemical.molecular_weight.value;
    } else if (chemical.type === ModelType.POLYMER) {
      if (chemical?.mn_avg && !Array.isArray(chemical.mn_avg)) {
        return chemical.mn_avg.value;
      } else if (chemical?.mn_avg && Array.isArray(chemical.mn_avg)) {
        if (chemical.mn_avg.length === 0) {
          return chemical.mn_avg[0].value;
        } else {
          let nmrMn = chemical.mn_avg.filter(
            (el: any) => el.technique === "nmr"
          );
          let gpcMn = chemical.mn_avg.filter(
            (el: any) => el.technique === "gpc"
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
    } else {
      throw new Error(
        `unhandled chemical type for selecting mw: ${chemical.type}`
      );
    }
  }

  private extractQuantity(properties: any): NamedQuantity {
    const qty = Object.keys(properties).find(
      (el) =>
        el === "mass" || el === "volume" || el === "moles" || el === "pressure"
    );

    if (!qty) {
      throw new Error(`No quantity information found!`);
    }

    return {
      name: qty,
      ...properties[qty],
    } as NamedQuantity;
  }
}
