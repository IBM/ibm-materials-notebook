import { ModelActivationRecord } from "./model-AR";
import { PROPERTIES, GROUPS, ModelType, CMDL } from "cmdl-types";
import { PolymerContainer } from "cmdl-polymers";
import Big from "big.js";

/**
 * Base class for interpreter models
 */
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
    chemicals: CMDL.ChemicalReference[],
    globalAR: ModelActivationRecord,
    params?: { volume?: CMDL.BigQty; temperature?: CMDL.BigQty }
  ): CMDL.ChemicalConfig[] {
    let configs: CMDL.ChemicalConfig[] = [];

    for (const chemical of chemicals) {
      let parentValues = globalAR.getValue<CMDL.Chemical | CMDL.Polymer>(
        chemical.name
      );

      if (!parentValues?.state) {
        throw new Error(`Physical state is undefined on ${chemical.name}`);
      }

      const quantity = this.extractQuantity(chemical);
      const mwValue = this.getMw(parentValues);
      const density =
        "density" in parentValues && parentValues?.density
          ? parentValues.density.value
          : null;

      const chemicalConfig: CMDL.ChemicalConfig = {
        name: chemical.name,
        mw: mwValue,
        smiles: parentValues.smiles,
        density: density,
        state: parentValues.state,
        roles: chemical.roles,
        temperature: params?.temperature,
        volume: params?.volume,
        limiting: chemical?.limiting ? true : false,
        quantity,
      };

      if (
        chemicalConfig.state === CMDL.ChemStates.LIQUID &&
        !chemicalConfig.density &&
        chemicalConfig.quantity.name === PROPERTIES.VOLUME
      ) {
        throw new Error(
          `Liquid chemical: ${this.name} has invalid density and a volume quantity`
        );
      }

      if (
        chemicalConfig.state === CMDL.ChemStates.GAS &&
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

  /**
   * Method for selecting an molecular weight value for polymers for
   * stoichiometry calculations
   * @TODO Fix typing and data formatting issues
   * @param chemical CMDLChemical | CMDLPolymer
   * @returns any
   */
  private getMw(chemical: CMDL.Chemical | CMDL.Polymer): any {
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

  /**
   * Method for examining the CMDLChemicalReference and determining the quantity type
   * for a chemical. Returns the quantity reformatted for stoichiometry calculations.
   * @param ref CMDLChemicalRefrerence
   * @returns NamedQuantity
   */
  private extractQuantity(ref: CMDL.ChemicalReference): CMDL.NamedQty {
    let name: CMDL.QuantityNames;
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

  protected initializePolymer(
    treeConfig: CMDL.PolymerContainer,
    record: ModelActivationRecord,
    polymer: PolymerContainer
  ): void {
    const queue: CMDL.PolymerContainer[] = [treeConfig];
    let curr: CMDL.PolymerContainer | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      const container = polymer.createPolymerContainer(curr.name);

      for (const node of curr.nodes) {
        const fragment = record.getValue<CMDL.Fragment>(node.ref.slice(1));
        const entity = polymer.createPolymerNode(node.ref.slice(1), fragment);
        container.add(entity);
      }

      if (curr?.connections) {
        for (const conn of curr.connections) {
          polymer.createPolymerEdges(conn, container);
        }

        if (curr?.containers?.length) {
          for (const cont of curr.containers) {
            cont.parent = curr.name;
            queue.unshift(cont);
          }
        }
      }

      polymer.insertContainer(container, curr?.parent);
    }
  }
}
