import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import {
  ResultEntity,
  CharDataEntity,
  PolymerEntity,
  ChemicalEntity,
  CharFileReader,
} from "../entities";
import { ModelType, PROPERTIES, TYPES } from "../../cmdl-types";

/**
 * Output model for characterization samples
 * Creates result items for chemicals and products of the experiment
 */
export class CharData extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.CHAR_DATA
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    try {
      const technique = this.modelAR.getValue<string>(PROPERTIES.TECHNIQUE);
      const sampleId = this.modelAR.getValue<string>(PROPERTIES.SAMPLE_ID);
      const timePoint = this.modelAR.getOptionalValue<TYPES.BigQty>(
        PROPERTIES.TIME_POINT
      );
      const references =
        this.modelAR.getOptionalValue<TYPES.CharReference[]>("references");
      const file = this.modelAR.getOptionalValue<TYPES.Reference>(
        PROPERTIES.FILE
      );
      const source = this.modelAR.getOptionalValue<TYPES.Reference>(
        PROPERTIES.SOURCE
      );
      const charModel = new CharDataEntity(this.name, this.type);

      let fileModel;
      if (file?.ref) {
        fileModel = globalAR.getValue<CharFileReader>(file.ref);
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
      charModel.add(PROPERTIES.SOURCE, source?.ref);

      if (references) {
        for (const ref of references) {
          let result = globalAR.getOptionalValue<ResultEntity>(
            `${ref.name}-${sampleId}`
          );

          if (!result) {
            const resultEntity = globalAR.getValue<
              PolymerEntity | ChemicalEntity
            >(ref.name);
            result = new ResultEntity(ref.name, "result", resultEntity);
            result.add(PROPERTIES.TIME_POINT, timePoint || null);
            result.add(PROPERTIES.SAMPLE_ID, sampleId);
            result.add(PROPERTIES.SOURCE, source?.ref);
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
