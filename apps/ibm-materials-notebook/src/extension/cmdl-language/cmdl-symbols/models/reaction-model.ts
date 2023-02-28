import { ChemicalSet } from "../chemicals";
import { ChemicalOutput } from "../chemicals/chemical-factory";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { cmdlLogger } from "../../logger";

interface ReactionOutput {
  name: string;
  type: string;
  temperature?: Record<string, any>;
  volume?: Record<string, any>;
  reactants: ChemicalOutput[];
  products: any[];
}

/**
 * Interpreter model to compute reaction stoichiometry for an experiment
 */
export class ReactionModel extends BaseModel {
  private reaction = new ChemicalSet();

  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const chemicals = this.modelAR.getValue("chemicals");
      const products = chemicals
        .filter((el: any) => el?.roles && el.roles.includes("product"))
        .map((el: any) => {
          const product = globalAR.getValue(el.name);
          if (product.type === "complex") {
            return {
              ...el,
              components: [
                ...product.components.map((comp: any) => {
                  return { name: comp.name, smiles: comp.smiles };
                }),
              ],
            };
          } else {
            return {
              ...el,
              smiles: product?.smiles ? product.smiles : null,
            };
          }
        });

      const reactants = chemicals.filter(
        (el: any) => el?.roles && !el.roles.includes("product")
      );

      const volume = this.modelAR.getOptionalValue("volume");
      const temperature = this.modelAR.getOptionalValue("temperature");

      const chemConfigs = this.createChemicalConfigs(reactants, globalAR, {
        volume,
        temperature,
      });

      this.reaction.insertMany(chemConfigs);

      const output = this.reaction.computeChemicalValues();

      const reactionOutput: ReactionOutput = {
        name: this.name,
        type: this.type,
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
