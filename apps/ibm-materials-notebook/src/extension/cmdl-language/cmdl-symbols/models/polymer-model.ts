import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "../polymers";
import { BigSMILES } from "ts-bigsmiles";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { CMDLRef, CMDLUnitless } from "../symbol-types";
import { CMDLPolymerGraph } from "./polymer-graph-model";
import { PROPERTIES } from "../../cmdl-types";
import { JSONPolymerTree } from "../polymers/polymer-container";

export type CMDLPolymerTreeValue = {
  name: string;
  path: string[];
  [PROPERTIES.DEGREE_POLY]: CMDLUnitless;
};

export class Polymer extends BaseModel {
  private polymerContainer: PolymerContainer;
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.POLYMER
  ) {
    super(name, modelAR, type);
    this.polymerContainer = new PolymerContainer(name);
  }

  execute(globalAR: ModelActivationRecord): void {
    const treeRef = this.modelAR.getValue<CMDLRef | JSONPolymerTree<null>>(
      PROPERTIES.TREE
    );
    const treeValues =
      this.modelAR.getOptionalValue<CMDLPolymerTreeValue[]>("treeValues");
    const bigSmilesStr = this.modelAR.getOptionalValue<string>(
      PROPERTIES.BIG_SMILES
    );

    let validatedStr: string | undefined;
    if (bigSmilesStr) {
      try {
        const bigSmilesParser = new BigSMILES(bigSmilesStr);
        validatedStr = bigSmilesParser.toString();
      } catch (error) {
        throw new Error(
          `Error during validating BigSMLIES ${bigSmilesStr}: ${
            error as string
          }`
        );
      }
    }

    if ("ref" in treeRef) {
      const polymerGraph = globalAR.getOptionalValue<CMDLPolymerGraph>(
        treeRef.ref
      );

      if (!polymerGraph) {
        throw new Error(`Polymer graph for ${treeRef.ref} is undefined!`);
      }

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
      if (name === PROPERTIES.TREE) {
        properties[name] = this.polymerContainer.treeToJSON();
      } else if (name === PROPERTIES.BIG_SMILES && validatedStr) {
        properties[name] = validatedStr;
      } else {
        properties[name] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
