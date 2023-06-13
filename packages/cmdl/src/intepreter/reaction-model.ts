import { ChemicalSet, ChemicalOutput } from "cmdl-chemicals";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel, CMDLChemical, CMDLPolymer } from "./base-model";
import { PROPERTIES, TAGS, ModelType } from "cmdl-types";
import { CMDLUnit } from "cmdl-units";
import { CMDLChemicalReference } from "./solution-model";
import { CMDLComplex, ComplexChemical, ComplexPolymer } from "./complex-model";
import { CMDLRxnProduct } from "./flow-model";

//TODO: move types to cmdl-types
export type REACTION = {
  [PROPERTIES.TEMPERATURE]: CMDLUnit;
  [PROPERTIES.VOLUME]?: CMDLUnit;
  [PROPERTIES.REACTION_TIME]: CMDLUnit;
};

export interface CMDLReaction {
  name: string;
  type: ModelType.REACTION;
  temperature?: CMDLUnit | null;
  volume?: CMDLUnit | null;
  reactants: ChemicalOutput[];
  products: CMDLRxnProduct[];
}

/**
 * Interpreter model to compute reaction stoichiometry for an experiment
 */
export class ReactionModel extends BaseModel {
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
        this.modelAR.getValue<CMDLChemicalReference[]>("chemicals");
      const products: CMDLRxnProduct[] = chemicals
        .filter(
          (el: CMDLChemicalReference) =>
            el?.roles && el.roles.includes(TAGS.PRODUCT)
        )
        .map((el: CMDLChemicalReference) => {
          const product = globalAR.getValue<
            CMDLChemical | CMDLComplex | CMDLPolymer
          >(el.name);

          if (product.type === ModelType.COMPLEX) {
            return {
              name: el.name,
              roles: el.roles,
              components: [
                ...product.components.map(
                  (comp: ComplexPolymer | ComplexChemical) => {
                    return { name: comp.name, smiles: comp.smiles };
                  }
                ),
              ],
            };
          } else {
            return {
              name: el.name,
              roles: el.roles,
              smiles: product?.smiles ? product.smiles : null,
            };
          }
        });

      const reactants = chemicals.filter(
        (el: CMDLChemicalReference) =>
          el?.roles && !el.roles.includes(TAGS.PRODUCT)
      );

      const volume = this.modelAR.getOptionalValue<CMDLUnit>(PROPERTIES.VOLUME);
      const temperature = this.modelAR.getOptionalValue<CMDLUnit>(
        PROPERTIES.TEMPERATURE
      );

      const chemConfigs = this.createChemicalConfigs(reactants, globalAR, {
        volume,
        temperature,
      });

      this.reaction.insertMany(chemConfigs);

      const output = this.reaction.computeChemicalValues();

      const reactionOutput: CMDLReaction = {
        name: this.name,
        type: ModelType.REACTION,
        volume: volume || null,
        temperature: temperature || null,
        products: products || [],
        reactants: output,
      };

      globalAR.setValue(this.name, reactionOutput);
    } catch (error) {
      throw new Error(
        `An error occured during executing reaction model ${this.name}: ${error}`
      );
    }
  }
}
