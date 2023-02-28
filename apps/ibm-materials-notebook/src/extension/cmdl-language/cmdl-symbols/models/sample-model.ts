import { ModelActivationRecord } from "./model-AR";
import { cmdlLogger as logger } from "../../logger";
import { BaseModel } from "./base-model";
import { PolymerContainer } from "../polymers";

type CharData = {
  name: string;
  type: string;
  references?: any[];
};

type RefResult = {
  technique: string;
  source: string;
  property: string;
  value: any;
  name: string;
  path: string[];
};

type CharOutput = {
  name: string;
  technique: string;
  sampleId: string;
  references: string[];
};

/**
 * Output model for characterization samples
 * Creates result items for chemicals and products of the experiment
 */
export class SampleOutput extends BaseModel {
  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      let charData = this.modelAR.getOptionalValue("charData");

      const results = this.createResults(charData, globalAR);
      const formattedCharData = this.formatCharacterizationData(charData);

      const sampleOutput = {
        name: this.name,
        type: "sample",
        results: results,
        charData: formattedCharData,
      };

      globalAR.setValue(this.name, sampleOutput);
    } catch (error) {
      throw new Error(
        `error during execution of model for sample ${this.name}: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Formats characterization data for writing to globalAR
   * @param charData CharData[]
   * @returns any[]
   */
  private formatCharacterizationData(charData: CharData[]) {
    return charData.map((char) => {
      const charRecord: Record<string, any> = {
        technique: char.type,
        name: char.name,
        sampleId: this.name,
        references: char?.references
          ? char.references.map(
              (el) =>
                `${el.name}${el.path.length ? `.${el.path.join(".")}` : ""}`
            )
          : [],
      };

      for (const [key, value] of Object.entries(char)) {
        if (key !== "references" && key !== "type" && key !== "name") {
          charRecord[key] = value;
        }
      }

      return charRecord;
    });
  }

  /**
   * Groups results by reference and then creates a result new result object from them with updated properties
   * @param charData any[]
   * @param globalAR ModelActivationRecord
   * @returns any[]
   */
  private createResults(charData: CharData[], globalAR: ModelActivationRecord) {
    const resultRecord = this.extractReferences(charData);
    let timePoint = this.modelAR.getOptionalValue("time_point");

    const finalResults = [];

    for (const [key, value] of Object.entries(resultRecord)) {
      let globalRef = globalAR.getValue(key);

      const finalResult = {
        name: key,
        type: globalRef.type,
        time_point: timePoint || null,
        sampleId: this.name,
      };

      if (globalRef.type === "chemical") {
        this.createSmallMolecule(finalResult, globalRef, value);
      } else if (globalRef.type === "polymer") {
        this.createPolymer(finalResult, globalRef, value);
      } else if (globalRef.type === "complex") {
        logger.debug(`global complex ref:`, { meta: globalRef });
        this.createComplex(finalResult, globalRef, value);
      }

      logger.verbose(`final result:`, { meta: finalResult });

      finalResults.push(finalResult);
    }
    return finalResults;
  }

  /**
   * Creates a map of references and their results
   * @param charData CharData[]
   * @returns Record<string, RefResult[]>
   */
  private extractReferences(charData: CharData[]) {
    const resultRecord: Record<string, RefResult[]> = {};
    charData.forEach((charExp: CharData) => {
      if (charExp?.references) {
        charExp.references.forEach((ref: any) => {
          let refResults: RefResult[] = [];

          for (const [key, value] of Object.entries(ref)) {
            if (key !== "name" && key !== "path") {
              let refResult = {
                technique: charExp.type,
                source: charExp.name,
                property: key,
                value: value,
                name: ref.name,
                path: ref.path,
              };
              refResults.push(refResult);
            }
          }

          if (resultRecord[ref.name]) {
            resultRecord[ref.name] = resultRecord[ref.name].concat(refResults);
          } else {
            resultRecord[ref.name] = refResults;
          }
        });
      }
    });

    return resultRecord;
  }

  private createComplex(result: any, ref: any, value: RefResult[]) {
    result.components = ref.components;

    for (const prop of value) {
      this.setMeasuredProperty(prop, result);
    }
  }

  /**
   * Creates a new small-molecule result for either inputs or outputs
   * @param result any
   * @param ref any
   */
  private createSmallMolecule(result: any, ref: any, value: RefResult[]) {
    result.molecular_weight = ref.molecular_weight;
    result.smiles = ref.smiles;
    result.state = ref.state;

    if (ref?.density) {
      result.density = ref.density;
    }

    for (const prop of value) {
      this.setMeasuredProperty(prop, result);
    }
  }

  /**
   * Creates a polymer result object containing a weighted polymer graph
   * @param result any
   * @param ref any
   */
  private createPolymer(result: any, ref: any, value: RefResult[]) {
    result.state = ref.state;

    let polymerWeights = [];
    for (const prop of value) {
      if (!prop.path.length) {
        this.setMeasuredProperty(prop, result);
      } else {
        polymerWeights.push(prop);
      }
    }

    if (ref?.tree) {
      const { tree } = this.computePolymerWeights(ref, polymerWeights);
      result.tree = tree;
    }
  }

  private setMeasuredProperty(prop: any, result: any) {
    const propValue = {
      ...prop.value,
      source: prop.source,
      technique: prop.technique,
    };
    if (result[prop.property]) {
      result[prop.property].push(propValue);
    } else {
      result[prop.property] = [propValue];
    }
  }

  /**
   * Extracts polymer tree from reference and embeds weights
   * @param ref any
   */
  private computePolymerWeights(ref: any, polymerWeights: any[]) {
    const polymer = new PolymerContainer(ref.name);
    polymer.initializeTreeFromJSON(ref.tree);
    polymer.addGraphValues(polymerWeights);
    polymer.computePolymerWeights();
    return {
      tree: polymer.treeToJSON(),
    };
  }
}
