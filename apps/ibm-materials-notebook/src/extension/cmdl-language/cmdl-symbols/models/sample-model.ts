import { ModelActivationRecord } from "./model-AR";
import { cmdlLogger as logger } from "../../logger";
import { BaseModel, CMDLChemical, CMDLPolymer } from "./base-model";
import { PolymerContainer } from "../polymers";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { PROPERTIES } from "../../cmdl-types";
import { CMDLComplex } from "./complex-model";
import { CMDLUnit } from "../symbol-types";
import { CMDLChemicalReference } from "./solution-model";

type CMDLCharData = {
  name: string;
  type: string;
  references?: CMDLChemicalReference[];
  [key: string]: CMDLChemicalReference[] | string | CMDLUnit | undefined;
};

export type CMDLSampleResult = {
  name: string;
  type: ModelType;
  [PROPERTIES.TIME_POINT]: CMDLUnit | null;
  sampleId: string;
  [key: string]:
    | CMDLUnit
    | string
    | ModelType
    | null
    | any[]
    | Record<string, any>;
};

export type CMDLSampleOutput = {
  name: string;
  type: ModelType.SAMPLE;
  results: CMDLSampleResult[];
  charData: CMDLCharOutput[];
};

type RefResult = {
  technique: string;
  source: string;
  property: string;
  value: any;
  name: string;
  path: string[];
};

export type CMDLCharOutput = {
  name: string;
  technique: string;
  sampleId: string;
  references: string[];
  [key: string]:
    | string
    | string[]
    | undefined
    | CMDLChemicalReference[]
    | CMDLUnit;
};

/**
 * Output model for characterization samples
 * Creates result items for chemicals and products of the experiment
 * @TODO Overhaul the data modeling for characterization data
 */
export class SampleOutput extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.SAMPLE
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      let charData = this.modelAR.getOptionalValue<CMDLCharData[]>("charData");

      if (!charData) {
        return;
      }

      const results = this.createResults(charData, globalAR);
      const formattedCharData = this.formatCharacterizationData(charData);

      const sampleOutput: CMDLSampleOutput = {
        name: this.name,
        type: ModelType.SAMPLE,
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
   * @returns CMDLCharOutput[]
   */
  private formatCharacterizationData(
    charData: CMDLCharData[]
  ): CMDLCharOutput[] {
    return charData.map((char) => {
      const charRecord: CMDLCharOutput = {
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
   * @param charData CharData[]
   * @param globalAR ModelActivationRecord
   * @returns CMDLSampleResult[]
   */
  private createResults(
    charData: CMDLCharData[],
    globalAR: ModelActivationRecord
  ): CMDLSampleResult[] {
    const resultRecord = this.extractReferences(charData);
    let timePoint = this.modelAR.getOptionalValue<CMDLUnit>(
      PROPERTIES.TIME_POINT
    );

    const finalResults = [];

    for (const [key, value] of Object.entries(resultRecord)) {
      let globalRef = globalAR.getValue<
        CMDLChemical | CMDLComplex | CMDLPolymer
      >(key);

      const finalResult: CMDLSampleResult = {
        name: key,
        type: globalRef.type,
        time_point: timePoint || null,
        sampleId: this.name,
      };

      if (globalRef.type === ModelType.CHEMICAL) {
        this.createSmallMolecule(finalResult, globalRef, value);
      } else if (globalRef.type === ModelType.POLYMER) {
        this.createPolymer(finalResult, globalRef, value);
      } else if (globalRef.type === ModelType.COMPLEX) {
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
  private extractReferences(charData: CMDLCharData[]) {
    const resultRecord: Record<string, RefResult[]> = {};
    charData.forEach((charExp: CMDLCharData) => {
      if (charExp?.references) {
        charExp.references.forEach((ref: CMDLChemicalReference) => {
          let refResults: RefResult[] = [];

          for (const [key, value] of Object.entries(ref)) {
            if (key !== "name" && key !== "path") {
              let refResult: RefResult = {
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

  /**
   * Creates a new complex result for either inputs or outputs
   * @param result CMDLSampleResult
   * @param ref CMDLComplex
   * @param value RefResult
   */
  private createComplex(
    result: CMDLSampleResult,
    ref: CMDLComplex,
    value: RefResult[]
  ) {
    result.components = ref.components;

    for (const prop of value) {
      this.setMeasuredProperty(prop, result);
    }
  }

  /**
   * Creates a new small-molecule result for either inputs or outputs
   * @param result CMDLSampleResult
   * @param ref CMDLChemical
   * @param value RefResult[]
   */
  private createSmallMolecule(
    result: CMDLSampleResult,
    ref: CMDLChemical,
    value: RefResult[]
  ) {
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
   * @param result CMDLSampleResult
   * @param ref CMDLPolymer
   * @param value RefResult[]
   */
  private createPolymer(
    result: CMDLSampleResult,
    ref: CMDLPolymer,
    value: RefResult[]
  ) {
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

  private setMeasuredProperty(prop: RefResult, result: CMDLSampleResult) {
    const propValue = {
      ...prop.value,
      source: prop.source,
      technique: prop.technique,
    };
    const propArray = result[prop.property];
    if (Array.isArray(propArray)) {
      propArray.push(propValue);
    } else {
      result[prop.property] = [propValue];
    }
  }

  /**
   * Extracts polymer tree from reference and embeds weights
   * @param ref CMDLPolymer
   * @param polymerWeights RefResult[]
   */
  private computePolymerWeights(ref: CMDLPolymer, polymerWeights: RefResult[]) {
    const polymer = new PolymerContainer(ref.name);
    polymer.initializeTreeFromJSON(ref.tree);
    polymer.addGraphValues(polymerWeights);
    polymer.computePolymerWeights();
    return {
      tree: polymer.treeToJSON(),
    };
  }
}
