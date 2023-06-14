import { ChemicalSet } from "cmdl-chemicals";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PROPERTIES, TAGS, ModelType, CMDL } from "cmdl-types";

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
        this.modelAR.getValue<CMDL.ChemicalReference[]>("chemicals");
      const products: CMDL.Product[] = chemicals
        .filter(
          (el: CMDL.ChemicalReference) =>
            el?.roles && el.roles.includes(TAGS.PRODUCT)
        )
        .map((el: CMDL.ChemicalReference) => {
          const product = globalAR.getValue<
            CMDL.Chemical | CMDL.Complex | CMDL.Polymer
          >(el.name);

          if (product.type === ModelType.COMPLEX) {
            return {
              name: el.name,
              roles: el.roles,
              components: [
                ...product.components.map(
                  (comp: CMDL.ComplexPolymer | CMDL.ComplexChemical) => {
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
        (el: CMDL.ChemicalReference) =>
          el?.roles && !el.roles.includes(TAGS.PRODUCT)
      );

      const volume = this.modelAR.getOptionalValue<CMDL.BigQty>(
        PROPERTIES.VOLUME
      );
      const temperature = this.modelAR.getOptionalValue<CMDL.BigQty>(
        PROPERTIES.TEMPERATURE
      );

      const chemConfigs = this.createChemicalConfigs(reactants, globalAR, {
        volume,
        temperature,
      });

      this.reaction.insertMany(chemConfigs);

      const output = this.reaction.computeChemicalValues();

      const reactionOutput: CMDL.Reaction = {
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
