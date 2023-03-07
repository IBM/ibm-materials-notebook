import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "../polymers";
import { BigSMILES } from "bigsmiles";
import { cmdlLogger } from "../../logger";

export class Polymer extends BaseModel {
  private polymerContainer: PolymerContainer;
  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getOptionalValue("tree");
    const treeValues = this.modelAR.getOptionalValue("treeValues");
    const bigSmilesStr = this.modelAR.getOptionalValue("big_smiles");

    let validatedStr: string | undefined;
    if (bigSmilesStr) {
      try {
        const bigSmilesParser = new BigSMILES(bigSmilesStr);
        validatedStr = bigSmilesParser.toString();
        cmdlLogger.silly(`validated bigSMILES ${validatedStr}`);
      } catch (error) {
        cmdlLogger.warn(`Invalid bigSmiles string ${bigSmilesStr}!`);
        throw new Error(
          `Error during validating BigSMLIES ${bigSmilesStr}: ${
            error as string
          }`
        );
      }
    }

    if (treeRef?.ref) {
      const polymerGraph = globalAR.getOptionalValue(treeRef.ref);
      this.polymerContainer.initializeTreeFromJSON(polymerGraph.tree);
    } else {
      this.polymerContainer.initializeTreeFromJSON(treeRef);
    }

    if (treeValues) {
      this.polymerContainer.addGraphValues(treeValues);
      this.polymerContainer.computePolymerWeights();
    }

    const polymerSmiles = this.polymerContainer.getSmilesStr();

    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
      smiles: polymerSmiles,
    };

    for (const [name, value] of this.modelAR.all()) {
      if (name === "tree") {
        properties[name] = this.polymerContainer.treeToJSON();
      } else if (name === "big_smiles" && validatedStr) {
        properties[name] = validatedStr;
      } else {
        properties[name] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
