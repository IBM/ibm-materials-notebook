import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import {
  ResultModel,
  CharDataModel,
  PolymerModel,
  ChemicalModel,
  CharFileReader,
} from "./models";
import { ModelType, PROPERTIES, TYPES } from "cmdl-types";
import { logger } from "../logger";

/**
 * Output model for characterization samples
 * Creates result items for chemicals and products of the experiment
 */
export class CharData extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.CHAR_DATA
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    try {
      const technique = this.modelAR.getValue<string>(PROPERTIES.TECHNIQUE);
      const sampleId = this.modelAR.getValue<string>(PROPERTIES.SAMPLE_ID);
      const timePoint = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.TIME_POINT
      );
      const references =
        this.modelAR.getOptionalValue<TYPES.CharReference[]>("references");
      const file = this.modelAR.getOptionalValue<TYPES.Reference>("file");
      const charModel = new CharDataModel(this.name, this.type);

      if (file?.ref) {
        const fileModel = globalAR.getValue<CharFileReader>(file.ref);
        charModel.add(PROPERTIES.FILE, {
          name: file.ref,
          ...fileModel.export(),
        });
      } else {
        charModel.add(PROPERTIES.FILE, null);
      }

      charModel.add(PROPERTIES.TIME_POINT, timePoint || null);
      charModel.add(PROPERTIES.TECHNIQUE, technique);
      charModel.add(PROPERTIES.SAMPLE_ID, sampleId);

      if (references) {
        for (const ref of references) {
          let result = globalAR.getOptionalValue<ResultModel>(
            `${ref.name}-${sampleId}`
          );

          if (!result) {
            const resultEntity = globalAR.getValue<
              PolymerModel | ChemicalModel
            >(ref.name);
            result = new ResultModel(ref.name, "result", resultEntity);
            result.add(PROPERTIES.TIME_POINT, timePoint || null);
            result.add(PROPERTIES.SAMPLE_ID, sampleId);
          }

          for (const [key, value] of Object.entries(ref)) {
            if (key !== "name" && key !== "path") {
              const measuredValue: TYPES.MeasuredProperty = {
                ...(value as TYPES.BigQty | TYPES.BigQtyUnitless),
                technique,
                source: sampleId,
              };

              if (measuredValue.unit === null) {
                measuredValue.path = ref.path;
              }
              result.addMeasuredProperty(
                key as keyof TYPES.MeasuredData,
                measuredValue
              );
            }
          }
          logger.debug(`setting result: ${result.resultName}`);
          globalAR.setValue(result.resultName, result);
        }
      }

      globalAR.setValue(this.name, charModel);
    } catch (error) {
      throw new Error(
        `error during execution of model for sample ${this.name}: ${
          (error as Error).message
        }`
      );
    }
  }
}
