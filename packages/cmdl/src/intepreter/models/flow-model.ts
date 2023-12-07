import { ActivationRecord } from "../model-AR";
import { BaseModel } from "./base-model";
import {
  ChemicalEntity,
  FlowRxnEntity,
  PolymerEntity,
  ReactorEntity,
  SolutionEntity,
} from "../entities";
import { ModelType, TYPES } from "../../cmdl-types";
import { ReactorChemicals } from "../../cmdl-reactors";
import { logger } from "../../logger";

export class FlowReaction extends BaseModel {
  constructor(
    name: string,
    modelAR: ActivationRecord,
    type: ModelType.FLOW_REACTION
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ActivationRecord): void {
    const reactorRef = this.modelAR.getValue<TYPES.Reference>("reactor");
    const references =
      this.modelAR.getValue<
        (TYPES.SolutionReference | TYPES.ChemicalReference)[]
      >("references");

    const { solutions, products } = this.extract(references);

    const finalProducts: TYPES.Product[] = products.map(
      (el: TYPES.ChemicalReference) => {
        const productEntity = globalAR.getValue<PolymerEntity | ChemicalEntity>(
          el.name
        );
        return {
          name: el.name,
          smiles: productEntity.getSMILES(),
          roles: el.roles,
        };
      }
    );

    const reactorModel = globalAR.getValue<ReactorEntity>(reactorRef.ref);
    const flowModel = new FlowRxnEntity(this.name, this.type);
    flowModel.addReactor(reactorModel);
    flowModel.add("products", finalProducts);

    for (const solution of solutions) {
      const solutionModel = globalAR.getValue<SolutionEntity>(solution.name);
      const solutionChemConfigs = solutionModel.getChemicalConfigs();
      flowModel.addEntities({ ...solutionModel.entities });
      const solutionChemicals = new ReactorChemicals(
        solutionChemConfigs,
        solution.flow_rate
      );
      solutionChemicals.computeInitialValues();

      const inputId = solution.input.path[solution.input.path.length - 1];
      reactorModel.setInput(inputId, solutionChemicals);
    }

    logger.debug(
      `flow entities: ${Object.keys(flowModel.entities).join(", ")}`
    );
    flowModel.processFlowRxn();

    globalAR.setValue(this.name, flowModel);
  }

  private extract(arr: (TYPES.SolutionReference | TYPES.ChemicalReference)[]) {
    const products: TYPES.ChemicalReference[] = [];
    const solutions: TYPES.SolutionReference[] = [];

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
