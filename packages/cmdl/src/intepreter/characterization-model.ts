import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";

class Result {
  name: string;
  sample_id: string;
  time_point: TYPES.BigQty | null = null;
  private readonly properties = new Map<
    keyof TYPES.MeasuredData,
    TYPES.MeasuredDataArray[keyof TYPES.MeasuredDataArray]
  >();
  constructor(name: string, sample_id: string, time_point?: TYPES.BigQty) {
    this.name = name;
    this.sample_id = sample_id;

    if (time_point) {
      this.time_point = time_point;
    }
  }

  get resultName() {
    return `${this.name}-${this.sample_id}`;
  }

  public add(
    key: keyof TYPES.MeasuredData,
    value: TYPES.MeasuredProperty | TYPES.MeasuredUnitlessProperty
  ): void {
    const currentValues = this.properties.get(key);
    if (currentValues && currentValues.length) {
      if (this.isUnitless(currentValues)) {
        this.properties.set(key, [
          ...currentValues,
          value as TYPES.MeasuredUnitlessProperty,
        ]);
      } else {
        this.properties.set(key, [
          ...currentValues,
          value as TYPES.MeasuredProperty,
        ]);
      }
    } else {
      this.properties.set(key, [value as any]);
    }
  }

  private isUnitless(
    arr: TYPES.MeasuredProperty[] | TYPES.MeasuredUnitlessProperty[]
  ): arr is TYPES.MeasuredUnitlessProperty[] {
    return !arr[0].unit;
  }
}

/**
 * Output model for characterization samples
 * Creates result items for chemicals and products of the experiment
 */
export class CharDataModel extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.CHAR_DATA
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const technique = this.modelAR.getValue<string>("technique");
      const sampleId = this.modelAR.getValue<string>("sample_id");
      const timePoint =
        this.modelAR.getOptionalValue<TYPES.BigQty>("timePoint");
      const references =
        this.modelAR.getOptionalValue<TYPES.CharReference[]>("references");
      const file = this.modelAR.getOptionalValue<TYPES.Reference>("file");

      const charOutput: TYPES.CharDataOutput = {
        name: this.name,
        type: ModelType.CHAR_DATA,
        time_point: timePoint || null,
        technique: technique,
        sample_id: sampleId,
        file: file?.ref || null,
      };

      //TODO: embed values in polymer graph?
      if (references) {
        for (const ref of references) {
          let result = globalAR.getOptionalValue<Result>(
            `${ref.name}-${sampleId}`
          );

          if (!result) {
            result = new Result(ref.name, sampleId, timePoint);
          }

          for (const [key, value] of Object.entries(ref)) {
            if (key !== "name" && key !== "path") {
              const measuredValue:
                | TYPES.MeasuredUnitlessProperty
                | TYPES.MeasuredProperty = {
                ...(value as TYPES.BigQty | TYPES.BigQtyUnitless),
                technique,
                source: sampleId,
              };

              if (measuredValue.unit === null) {
                measuredValue.path = ref.path;
              }
              result.add(key as keyof TYPES.MeasuredData, measuredValue);
            }
          }

          globalAR.setValue(result.resultName, result);
        }
      }

      globalAR.setValue(this.name, charOutput);
    } catch (error) {
      throw new Error(
        `error during execution of model for sample ${this.name}: ${
          (error as Error).message
        }`
      );
    }
  }

  /**
   * Groups results by reference and then creates a result new result object from them with updated properties
   * @param refData TYPES.CharReference[]
   * @param globalAR ModelActivationRecord
   * @returns CMDLSampleResult[]
   */
  // private createResults(
  //   refData: TYPES.CharReference[],
  //   technique: string,
  //   time_point: TYPES.BigQty | undefined
  //   // globalAR: ModelActivationRecord
  // ): TYPES.CharResult[] {
  //   const finalResults = [];

  //   for (const reference of refData) {
  //     // let globalRef = globalAR.getValue<
  //     //   TYPES.Chemical | TYPES.Complex | TYPES.Polymer
  //     // >(reference.name);

  //     const finalResult: TYPES.CharResult = {
  //       ...reference,
  //       time_point: time_point || null,
  //       sample_id: this.name,
  //       technique: technique,
  //     };

  //     //TODO: if path => embed properties

  //     // if (globalRef.type === ModelType.CHEMICAL) {
  //     //   this.createSmallMolecule(finalResult, globalRef, reference);
  //     // } else if (globalRef.type === ModelType.POLYMER) {
  //     //   this.createPolymer(finalResult, globalRef, reference);
  //     // } else if (globalRef.type === ModelType.COMPLEX) {
  //     //   this.createComplex(finalResult, globalRef, reference);
  //     // }

  //     finalResults.push(finalResult);
  //   }
  //   return finalResults;
  // }

  // /**
  //  * Creates a map of references and their results
  //  * @param charData CharData[]
  //  * @deprecated
  //  * @returns Record<string, RefResult[]>
  //  */
  // private extractReferences(
  //   charData: TYPES.CharData[]
  // ): Record<string, TYPES.RefResult[]> {
  //   const resultRecord: Record<string, TYPES.RefResult[]> = {};
  //   charData.forEach((charExp: TYPES.CharData) => {
  //     if (charExp?.references) {
  //       charExp.references.forEach((ref: TYPES.ChemicalReference) => {
  //         let refResults: TYPES.RefResult[] = [];

  //         for (const [key, value] of Object.entries(ref)) {
  //           if (key !== "name" && key !== "path") {
  //             let refResult: TYPES.RefResult = {
  //               technique: charExp.type, //?! deprecated
  //               source: charExp.name,
  //               property: key,
  //               value: value,
  //               name: ref.name,
  //               path: ref.path,
  //             };
  //             refResults.push(refResult);
  //           }
  //         }

  //         if (resultRecord[ref.name]) {
  //           resultRecord[ref.name] = resultRecord[ref.name].concat(refResults);
  //         } else {
  //           resultRecord[ref.name] = refResults;
  //         }
  //       });
  //     }
  //   });

  //   return resultRecord;
  // }

  // /**
  //  * Creates a new complex result for either inputs or outputs
  //  * @param result CMDLSampleResult
  //  * @param ref CMDLComplex
  //  * @param value RefResult
  //  */
  // private createComplex(
  //   result: TYPES.CharResult,
  //   ref: TYPES.Complex,
  //   value: TYPES.CharReference[]
  // ): void {
  //   result.components = ref.components;

  //   for (const prop of value) {
  //     this.setMeasuredProperty(prop, result);
  //   }
  // }

  /**
   * Creates a new small-molecule result for either inputs or outputs
   * @param result CMDLSampleResult
   * @param ref CMDLChemical
   * @param value RefResult[]
   */
  // private createSmallMolecule(
  //   result: TYPES.CharResult,
  //   ref: TYPES.Chemical,
  //   value: TYPES.RefResult[]
  // ): void {
  //   result.molecular_weight = ref.molecular_weight; //! deprecated => stored in entities
  //   result.smiles = ref.smiles; //! deprecated => stored in entities
  //   result.state = ref.state; //! deprecated => stored in entities

  //   if (ref?.density) {
  //     result.density = ref.density; //! deprecated stored in entities
  //   }

  //   for (const prop of value) {
  //     this.setMeasuredProperty(prop, result);
  //   }
  // }

  /**
   * Creates a polymer result object containing a weighted polymer graph
   * @param result CMDLSampleResult
   * @param ref CMDLPolymer
   * @param value RefResult[]
   */
  // private createPolymer(
  //   result: TYPES.SampleResult,
  //   ref: TYPES.Polymer,
  //   value: TYPES.RefResult[]
  // ): void {
  //   result.state = ref.state;

  //   let polymerWeights = [];
  //   for (const prop of value) {
  //     if (!prop.path.length) {
  //       this.setMeasuredProperty(prop, result);
  //     } else {
  //       polymerWeights.push(prop);
  //     }
  //   }

  //   if (ref?.tree) {
  //     const { tree } = this.computePolymerWeights(ref, polymerWeights);
  //     result.tree = tree; //! deprecated put serialized string?
  //   }
  // }

  // private setMeasuredProperty(
  //   prop: TYPES.RefResult,
  //   result: TYPES.SampleResult
  // ) {
  //   const propValue = {
  //     ...prop.value,
  //     source: prop.source,
  //     technique: prop.technique, //!? deprecated
  //   };
  //   const propArray = result[prop.property];
  //   if (Array.isArray(propArray)) {
  //     propArray.push(propValue);
  //   } else {
  //     result[prop.property] = [propValue];
  //   }
  // }

  /**
   * Extracts polymer tree from reference and embeds weights
   * @param ref CMDLPolymer
   * @param polymerWeights RefResult[]
   */
  // private computePolymerWeights(
  //   ref: TYPES.Polymer,
  //   polymerWeights: TYPES.RefResult[]
  // ): { tree: JSONPolymerContainer } {
  //   const polymer = new PolymerContainer(ref.name); //! deprecated => clone
  //   polymer.initializeTreeFromJSON(ref.tree); //! deprecated => clone
  //   polymer.addGraphValues(polymerWeights);
  //   polymer.computePolymerWeights();
  //   return {
  //     tree: polymer.treeToJSON(), //! export serialized string
  //   };
  // }
}
