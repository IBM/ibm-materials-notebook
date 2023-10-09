import Gas from "./gas";
import Solid from "./solid";
import Liquid from "./liquid";
import { TYPES } from "@ibm-materials/cmdl-types";

/**
 * Class for creating and initializing chemical instances from ChemicalConfigs
 */
export default class ChemicalFactory {
  public create(chemConfig: TYPES.ChemicalConfig): Solid | Liquid | Gas {
    if (chemConfig.state === TYPES.ChemStates.SOLID) {
      return this.buildSolid(chemConfig);
    } else if (chemConfig.state === TYPES.ChemStates.GAS) {
      return this.buildGas(chemConfig);
    } else if (chemConfig.state === TYPES.ChemStates.LIQUID) {
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
  private buildSolid(config: TYPES.ChemicalConfig): Solid {
    const solid = new Solid(
      config.name,
      config.roles,
      config.mw,
      config.limiting
    );
    solid.computeValues(config.quantity);
    return solid;
  }

  /**
   * Creates a new Gas chemical
   * @param config ChemicalConfig
   * @returns Gas
   */
  private buildGas(config: TYPES.ChemicalConfig): Gas {
    if (!config.volume || !config.temperature) {
      throw new Error(
        `Inadequate information to compute gas quantities: volume ${config.volume}, temperature: ${config.temperature}`
      );
    }

    const gas = new Gas(config.name, config.roles, config.mw, config.limiting);
    gas.initializeValues(config.volume, config.quantity);
    gas.computeValues(config.temperature);
    return gas;
  }

  /**
   * Creates a new liquid chemical
   * @param config ChemicalConfig
   * @returns Liquid
   */
  private buildLiquid(config: TYPES.ChemicalConfig): Liquid {
    if (!config.density) {
      throw new Error(`${config.name} does not have a valid density`);
    }

    const liquid = new Liquid(
      config.name,
      config.roles,
      config.mw,
      config.density,
      config.limiting
    );

    liquid.computeValues(config.quantity);
    return liquid;
  }
}
