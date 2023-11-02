import { ActivationRecord } from "../model-AR";
import { ModelType } from "../../cmdl-types";

/**
 * Base class for interpreter models
 *
 */
export abstract class BaseModel {
  constructor(
    public name: string,
    public modelAR: ActivationRecord,
    public type: ModelType
  ) {}

  /**
   * Method to execute model for computation or tabulation of properties.
   * Writes values to parent activation record.
   * @param globalAR ModelActivationRecord
   */
  abstract execute(globalAR: ActivationRecord): void;
}
