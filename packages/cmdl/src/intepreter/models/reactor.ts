import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "../../cmdl-types";
import { ReactorEntity } from "../entities";

export class Reactor extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.REACTOR_GRAPH
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    const nodes =
      this.modelAR.getValue<(TYPES.ReactorNode | TYPES.Reactor)[]>(
        "components"
      );

    const reactorModel = new ReactorEntity(this.name, this.type);
    reactorModel.initializeReactor(nodes);

    globalAR.setValue(this.name, reactorModel);
  }
}
