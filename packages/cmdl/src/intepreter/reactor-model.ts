import { ModelActivationRecord } from "./model-AR";
import { BaseModel, ReactorModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";

export class Reactor extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.REACTOR_GRAPH
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const nodes =
      this.modelAR.getValue<(TYPES.ReactorNode | TYPES.Reactor)[]>(
        "components"
      );

    const reactorModel = new ReactorModel(this.name, this.type);
    reactorModel.initializeReactor(nodes);

    globalAR.setValue(this.name, reactorModel);
  }
}
