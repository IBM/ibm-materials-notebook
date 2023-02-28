import { ReactorChemicals, ReactorContainer } from "../reactor";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

export class FlowReaction extends BaseModel {
  private reactorContainer = new ReactorContainer();

  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }

  execute(globalAR: ModelActivationRecord): void {
    const reactorRef = this.modelAR.getValue("reactor");
    const solutions = this.modelAR.getValue("solutions");
    const products = this.modelAR.getOptionalValue("products");

    const finalProducts = products.map((el: any) => {
      const product = globalAR.getValue(el.name);
      return {
        ...el,
        smiles: product?.smiles ? product.smiles : null,
      };
    });

    const reactorConfig = globalAR.getValue(reactorRef.ref);

    this.reactorContainer.deserialize(reactorConfig);

    for (const solution of solutions) {
      let solutionOutput = globalAR.getValue(solution.name);

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
