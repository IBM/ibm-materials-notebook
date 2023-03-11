import Gas from "./gas";
import Solid from "./solid";
import Liquid from "./liquid";
import { PROPERTIES } from "../../cmdl-types";
import { NumberQuantity, Quantity } from "../symbol-types";
import { ReactionRoles } from "../../cmdl-types";
import Big from "big.js";

export enum ChemStates {
  SOLID = "solid",
  LIQUID = "liquid",
  GAS = "gas",
}

export interface NamedQuantity extends Quantity {
  name:
    | PROPERTIES.MASS
    | PROPERTIES.VOLUME
    | PROPERTIES.MOLES
    | PROPERTIES.PRESSURE;
}

export interface ChemicalConfig {
  name: string;
  mw: Big;
  smiles?: string;
  density: Big | null;
  state: ChemStates;
  roles: ReactionRoles[];
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
  roles: ReactionRoles[];
  molarity: NumberQuantity;
  molality: NumberQuantity;
  moles_vol: NumberQuantity;
  limiting: boolean;
}

/**
 * Class for creating and initializing chemical instances from ChemicalConfigs
 */
export default class ChemicalFactory {
  public create(chemConfig: ChemicalConfig): Solid | Liquid | Gas {
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

  /**
   * Creates a new Solid chemical
   * @param config ChemicalConfig
   * @returns Solid
   */
  private buildSolid(config: ChemicalConfig): Solid {
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

  /**
   * Creates a new Gas chemical
   * @param config ChemicalConfig
   * @returns Gas
   */
  private buildGas(config: ChemicalConfig): Gas {
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

  /**
   * Creates a new liquid chemical
   * @param config ChemicalConfig
   * @returns Liquid
   */
  private buildLiquid(config: ChemicalConfig): Liquid {
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
