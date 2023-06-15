import { ModelActivationRecord } from "./model-AR";
import { logger } from "../logger";
import { BaseModel } from "./base-model";
import { PolymerContainer, JSONPolymerContainer } from "cmdl-polymers";
import { PROPERTIES, ModelType, TYPES } from "cmdl-types";

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
      let charData =
        this.modelAR.getOptionalValue<TYPES.CharData[]>("charData");

      if (!charData) {
        return;
      }

      const results = this.createResults(charData, globalAR);
      const formattedCharData = this.formatCharacterizationData(charData);

      const sampleOutput: TYPES.SampleOutput = {
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
   * @param charData TYPES.CharData[]
   * @returns TYPES.CharOutput[]
   */
  private formatCharacterizationData(
    charData: TYPES.CharData[]
  ): TYPES.CharOutput[] {
    return charData.map((char) => {
      const charRecord: TYPES.CharOutput = {
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
    charData: TYPES.CharData[],
    globalAR: ModelActivationRecord
  ): TYPES.SampleResult[] {
    const resultRecord = this.extractReferences(charData);
    let timePoint = this.modelAR.getOptionalValue<TYPES.BigQty>(
      PROPERTIES.TIME_POINT
    );

    const finalResults = [];

    for (const [key, value] of Object.entries(resultRecord)) {
      let globalRef = globalAR.getValue<
        TYPES.Chemical | TYPES.Complex | TYPES.Polymer
      >(key);

      const finalResult: TYPES.SampleResult = {
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
  private extractReferences(
    charData: TYPES.CharData[]
  ): Record<string, TYPES.RefResult[]> {
    const resultRecord: Record<string, TYPES.RefResult[]> = {};
    charData.forEach((charExp: TYPES.CharData) => {
      if (charExp?.references) {
        charExp.references.forEach((ref: TYPES.ChemicalReference) => {
          let refResults: TYPES.RefResult[] = [];

          for (const [key, value] of Object.entries(ref)) {
            if (key !== "name" && key !== "path") {
              let refResult: TYPES.RefResult = {
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
    result: TYPES.SampleResult,
    ref: TYPES.Complex,
    value: TYPES.RefResult[]
  ): void {
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
    result: TYPES.SampleResult,
    ref: TYPES.Chemical,
    value: TYPES.RefResult[]
  ): void {
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
    result: TYPES.SampleResult,
    ref: TYPES.Polymer,
    value: TYPES.RefResult[]
  ): void {
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

  private setMeasuredProperty(
    prop: TYPES.RefResult,
    result: TYPES.SampleResult
  ) {
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
  private computePolymerWeights(
    ref: TYPES.Polymer,
    polymerWeights: TYPES.RefResult[]
  ): { tree: JSONPolymerContainer } {
    const polymer = new PolymerContainer(ref.name);
    polymer.initializeTreeFromJSON(ref.tree);
    polymer.addGraphValues(polymerWeights);
    polymer.computePolymerWeights();
    return {
      tree: polymer.treeToJSON(),
    };
  }
}
