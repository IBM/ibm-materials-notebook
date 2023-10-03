import { ChemicalSet } from "cmdl-chemicals";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PROPERTIES, TAGS, ModelType, TYPES } from "cmdl-types";
import { ProtocolModel, ReactionModel } from "./models";
import { logger } from "../logger";

/**
 * Interpreter model to compute reaction stoichiometry for an experiment
 */
export class Reaction extends BaseModel {
  private reaction = new ChemicalSet();

  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.REACTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const chemicals =
        this.modelAR.getValue<TYPES.ChemicalReference[]>("references");
      const products: TYPES.Product[] = chemicals
        .filter(
          (el: TYPES.ChemicalReference) =>
            el?.roles && el.roles.includes(TAGS.PRODUCT)
        )
        .map((el: TYPES.ChemicalReference) => {
          const product = globalAR.getValue<
            TYPES.Chemical | TYPES.Complex | TYPES.Polymer
          >(el.name);

          if (product.type === ModelType.COMPLEX) {
            return {
              name: el.name,
              roles: el.roles,
              components: [
                ...product.components.map(
                  (comp: TYPES.ComplexPolymer | TYPES.ComplexChemical) => {
                    return { name: comp.name };
                  }
                ),
              ],
            };
          } else {
            return {
              name: el.name,
              roles: el.roles,
            };
          }
        });

      const reactants = chemicals.filter(
        (el: TYPES.ChemicalReference) =>
          el?.roles && !el.roles.includes(TAGS.PRODUCT)
      );

      logger.debug(
        `Reactants: \n\t-${reactants.map((el) => el.name).join("\n\t-")}`
      );

      const volume = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.VOLUME
      );
      const temperature = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.TEMPERATURE
      );
      const reaction_time = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.REACTION_TIME
      );

      const protocol = this.modelAR.getOptionalValue<TYPES.Reference>(
        PROPERTIES.PROTOCOL
      );

      const reactionModel = new ReactionModel(this.name, this.type);
      reactionModel.add(PROPERTIES.TEMPERATURE, temperature);
      reactionModel.add(PROPERTIES.VOLUME, volume);
      reactionModel.add(PROPERTIES.REACTION_TIME, reaction_time);
      reactionModel.add("products", products);
      reactionModel.insertChemicals(reactants, globalAR);

      if (protocol) {
        const protocolModel = globalAR.getValue<ProtocolModel>(protocol.ref);
        const reactionOutput = reactionModel.getReactionValues();
        protocolModel.extractReferences(reactionOutput);
        const serializedProtocol = protocolModel.serializeProtocol();
        reactionModel.add(PROPERTIES.PROTOCOL, serializedProtocol);
      }

      globalAR.setValue(this.name, reactionModel);
    } catch (error) {
      throw new Error(
        `An error occured during executing reaction model ${this.name}: ${error}`
      );
    }
  }
}
