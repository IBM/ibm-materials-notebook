import { ReactorChemicals, ReactorContainer } from "../reactor";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel, CMDLChemical, CMDLPolymer } from "./base-model";
import { ModelType } from "../../cmdl-types/groups/group-types";
import {
  CMDLChemicalReference,
  CMDLSolution,
  CMDLSolutionReference,
} from "./solution-model";
import { CMDLRef } from "../symbol-types";
import { SerializedReactor } from "../reactor/reactor-container";

export class FlowReaction extends BaseModel {
  private reactorContainer = new ReactorContainer();

  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.FLOW_REACTION
  ) {
    super(name, modelAR, type);
  }

  execute(globalAR: ModelActivationRecord): void {
    const reactorRef = this.modelAR.getValue<CMDLRef>("reactor");
    const solutions =
      this.modelAR.getValue<CMDLSolutionReference[]>("solutions");
    const products = this.modelAR.getValue<CMDLChemicalReference[]>("products");

    const finalProducts = products.map((el: CMDLChemicalReference) => {
      const product = globalAR.getValue<CMDLChemical | CMDLPolymer>(el.name);
      return {
        ...el,
        smiles: product?.smiles ? product.smiles : null,
      };
    });

    const reactorConfig = globalAR.getValue<SerializedReactor>(reactorRef.ref);

    this.reactorContainer.deserialize(reactorConfig);

    for (const solution of solutions) {
      let solutionOutput = globalAR.getValue<CMDLSolution>(solution.name);

      const solutionChemicals = new ReactorChemicals(solution.flow_rate);
      solutionChemicals.setChemicals(solutionOutput.componentConfigs);
      solutionChemicals.computeInitialValues();

      const inputId = solution.input.path[solution.input.path.length - 1];
      this.reactorContainer.setNodeInput(inputId, solutionChemicals);
    }

    this.reactorContainer.processReactor();
    const reactorOutput = this.reactorContainer.getOutputs();

    globalAR.setValue(this.name, {
      name: this.name,
      type: this.type,
      reactions: reactorOutput,
      products: finalProducts || [],
    });
  }
}
