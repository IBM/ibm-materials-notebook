import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import {
  SerializedReactor,
  ReactorChemicals,
  ReactorContainer,
} from "cmdl-reactors";

export class FlowReaction extends BaseModel {
  private reactorContainer = new ReactorContainer();

  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.FLOW_REACTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const reactorRef = this.modelAR.getValue<TYPES.Reference>("reactor");
    const solutions =
      this.modelAR.getValue<TYPES.SolutionReference[]>("solutions");
    const products =
      this.modelAR.getValue<TYPES.ChemicalReference[]>("products");

    const finalProducts: TYPES.Product[] = products.map(
      (el: TYPES.ChemicalReference) => {
        const product = globalAR.getValue<TYPES.Chemical | TYPES.Polymer>(
          el.name
        );
        return {
          name: el.name,
          smiles: product?.smiles ? product.smiles : null,
          roles: el.roles,
        };
      }
    );

    const reactorConfig = globalAR.getValue<SerializedReactor>(reactorRef.ref);

    this.reactorContainer.deserialize(reactorConfig);

    for (const solution of solutions) {
      let solutionOutput = globalAR.getValue<TYPES.Solution>(solution.name);

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
