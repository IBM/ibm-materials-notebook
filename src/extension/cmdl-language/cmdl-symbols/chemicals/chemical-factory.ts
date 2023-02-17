import Gas from "./gas";
import Solid from "./solid";
import Liquid from "./liquid";
import { ChemPropKey } from "./base-chemical";
import { NumberQuantity, Quantity } from "../symbol-types";
import Big from "big.js";

export enum ChemStates {
  SOLID = "solid",
  LIQUID = "liquid",
  GAS = "gas",
}

export interface NamedQuantity extends Quantity {
  name: ChemPropKey;
}

export interface ChemicalConfig {
  name: string;
  mw: Big;
  smiles?: string;
  density: Big | null;
  state: ChemStates;
  roles: string[];
  quantity: NamedQuantity;
  volume?: Quantity;
  temperature?: Quantity;
  limiting: boolean;
}

export interface ChemicalOutput {
  name: string;
  mw: Big | null;
  density: Big | null;
  smiles: string | null;
  mass: NumberQuantity;
  volume: NumberQuantity | null;
  moles: NumberQuantity;
  pressure: NumberQuantity | null;
  ratio: number | null;
  roles: string[];
  molarity: NumberQuantity;
  molality: NumberQuantity;
  moles_vol: NumberQuantity;
  limiting: boolean;
}

export default class ChemicalFactory {
  public create(chemConfig: ChemicalConfig) {
    if (chemConfig.state === ChemStates.SOLID) {
      return this.buildSolid(chemConfig);
    } else if (chemConfig.state === ChemStates.GAS) {
      return this.buildGas(chemConfig);
    } else if (chemConfig.state === ChemStates.LIQUID) {
      return this.buildLiquid(chemConfig);
    } else {
      throw new Error(`Unhandled chemical type: ${chemConfig.name}`);
    }
  }

  private buildSolid(config: ChemicalConfig) {
    const solid = new Solid(
      config.name,
      config.roles,
      config.mw,
      config.limiting,
      config.smiles
    );
    solid.computeValues(config.quantity);
    return solid;
  }

  private buildGas(config: ChemicalConfig) {
    if (!config.volume || !config.temperature) {
      throw new Error(
        `Inadequate information to compute gas quantities: volume ${config.volume}, temperature: ${config.temperature}`
      );
    }

    const gas = new Gas(
      config.name,
      config.roles,
      config.mw,
      config.limiting,
      config.smiles
    );
    gas.initializeValues(config.volume, config.quantity);
    gas.computeValues(config.temperature);
    return gas;
  }

  private buildLiquid(config: ChemicalConfig) {
    if (!config.density) {
      throw new Error(`${config.name} does not have a valid density`);
    }

    const liquid = new Liquid(
      config.name,
      config.roles,
      config.mw,
      config.density,
      config.limiting,
      config.smiles
    );

    liquid.computeValues(config.quantity);
    return liquid;
  }
}
