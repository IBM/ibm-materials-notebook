import { ModelActivationRecord } from "./model-AR";
import { ModelType } from "@ibm-materials/cmdl-types";

/**
 * Base class for interpreter models
 *
 */
export abstract class BaseModel {
  constructor(
    public name: string,
    public modelAR: ModelActivationRecord,
    public type: ModelType
  ) {}

  /**
   * Method to execute model for computation or tabulation of properties.
   * Writes values to parent activation record.
   * @param globalAR ModelActivationRecord
   */
  abstract execute(globalAR: ModelActivationRecord): void;
}
