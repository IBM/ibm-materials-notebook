import { ChemicalSet } from "../../cmdl-chemicals";
import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { PROPERTIES, ModelType, TYPES } from "../../cmdl-types";
import { ReactionEntity } from "../entities";

/**
 * Interpreter model to compute reaction stoichiometry for an experiment
 */
export class Reaction extends BaseModel {
  private reaction = new ChemicalSet();

  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.REACTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    try {
      const chemicals =
        this.modelAR.getValue<TYPES.ChemicalReference[]>("references");

      const volume = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.VOLUME
      );
      const temperature = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.TEMPERATURE
      );
      const reaction_time = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.REACTION_TIME
      );

      const date = this.modelAR.getOptionalValue<string>(PROPERTIES.DATE);

      const reactionModel = new ReactionEntity(this.name, this.type);
      reactionModel.add(PROPERTIES.TEMPERATURE, temperature);
      reactionModel.add(PROPERTIES.VOLUME, volume);
      reactionModel.add(PROPERTIES.REACTION_TIME, reaction_time);
      reactionModel.add(PROPERTIES.DATE, date);
      reactionModel.insertChemicals(chemicals, globalAR);

      globalAR.setValue(this.name, reactionModel);
    } catch (error) {
      throw new Error(
        `An error occured during executing reaction model ${this.name}: ${error}`
      );
    }
  }
}
