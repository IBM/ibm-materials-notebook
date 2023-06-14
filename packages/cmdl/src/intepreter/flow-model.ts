import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, CMDL } from "cmdl-types";
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
    const reactorRef = this.modelAR.getValue<CMDL.Reference>("reactor");
    const solutions =
      this.modelAR.getValue<CMDL.SolutionReference[]>("solutions");
    const products =
      this.modelAR.getValue<CMDL.ChemicalReference[]>("products");

    const finalProducts: CMDL.Product[] = products.map(
      (el: CMDL.ChemicalReference) => {
        const product = globalAR.getValue<CMDL.Chemical | CMDL.Polymer>(
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
      let solutionOutput = globalAR.getValue<CMDL.Solution>(solution.name);

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
