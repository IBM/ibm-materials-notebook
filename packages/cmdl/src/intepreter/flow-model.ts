import { ModelActivationRecord } from "./model-AR";
import {
  BaseModel,
  FlowRxnModel,
  ReactorModel,
  SolutionModel,
} from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { ReactorChemicals } from "cmdl-reactors";

export class FlowReaction extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.FLOW_REACTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const reactorRef = this.modelAR.getValue<TYPES.Reference>("reactor");
    const references =
      this.modelAR.getValue<
        (TYPES.SolutionReference | TYPES.ChemicalReference)[]
      >("references");

    const { solutions, products } = this.extract(references);

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

    const reactorModel = globalAR.getValue<ReactorModel>(reactorRef.ref);
    const flowModel = new FlowRxnModel(this.name, this.type);
    flowModel.addReactor(reactorModel);
    flowModel.add("products", finalProducts);

    for (const solution of solutions) {
      const solutionModel = globalAR.getValue<SolutionModel>(solution.name);

      const solutionChemicals = new ReactorChemicals(solution.flow_rate);
      solutionChemicals.setChemicals(solutionModel.getChemicalConfigs());
      solutionChemicals.computeInitialValues();

      const inputId = solution.input.path[solution.input.path.length - 1];
      reactorModel.setInput(inputId, solutionChemicals);
    }

    flowModel.processFlowRxn();

    globalAR.setValue(this.name, flowModel);
  }

  private extract(arr: (TYPES.SolutionReference | TYPES.ChemicalReference)[]) {
    let products: TYPES.ChemicalReference[] = [];
    let solutions: TYPES.SolutionReference[] = [];

    for (const item of arr) {
      if ("roles" in item) {
        products.push(item);
      } else {
        solutions.push(item);
      }
    }
    return { solutions, products };
  }
}
