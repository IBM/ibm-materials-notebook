import { ChemicalSet } from "@ibm-materials/cmdl-chemicals";
import { Model } from "./model";
import { ModelType, TYPES } from "@ibm-materials/cmdl-types";
import {
  ReactorChemicals,
  ReactorContainer,
} from "@ibm-materials/cmdl-reactors";
import { ModelActivationRecord } from "../model-AR";
import { ChemicalTranslator } from "./utils";
import { logger } from "../../logger";

export class ReactionModel extends Model<TYPES.Reaction> {
  private chemicals = new ChemicalSet();

  public insertChemicals(
    chemRefs: TYPES.ChemicalReference[],
    globalAR: ModelActivationRecord
  ) {
    const chemConfigs = ChemicalTranslator.createChemicalConfigs(
      chemRefs,
      globalAR,
      {
        volume: this.properties.volume,
        temperature: this.properties.temperature,
      }
    );
    logger.debug(
      `Reactants: \n\t-${chemConfigs.map((el) => el.name).join("\n\t-")}`
    );
    this.chemicals.insertMany(chemConfigs);
  }

  public getReactionValues(): TYPES.ChemicalOutput[] {
    return this.chemicals.computeChemicalValues();
  }

  public export(): TYPES.Reaction {
    this.chemicals.computeChemicalValues();
    return {
      ...this.properties,
      name: this.name,
      type: ModelType.REACTION,
      reactants: this.chemicals.chemicalValues,
    };
  }
}

export class SolutionModel extends Model<TYPES.Solution> {
  private chemicals = new ChemicalSet();

  public insertChemicals(
    chemRefs: TYPES.ChemicalReference[],
    globalAR: ModelActivationRecord
  ) {
    const chemConfigs = ChemicalTranslator.createChemicalConfigs(
      chemRefs,
      globalAR
    );
    this.chemicals.insertMany(chemConfigs);
    this.chemicals.computeChemicalValues();
  }

  public getChemicalConfigs(): TYPES.ChemicalConfig[] {
    return this.chemicals.exportSet();
  }

  public export(): TYPES.Solution {
    return {
      ...this.properties,
      name: this.name,
      type: ModelType.SOLUTION,
      components: this.chemicals.chemicalValues,
    };
  }
}

export class ReactorModel extends Model<TYPES.Reactor> {
  private reactor = new ReactorContainer();

  public initializeReactor(nodes: (TYPES.ReactorNode | TYPES.Reactor)[]): void {
    for (const node of nodes) {
      if (node.type === "reactor") {
        this.reactor.addReactor(node);
      } else if (node.type === "component") {
        this.reactor.addNode(node);
      } else {
        throw new Error(`Unrecognized node type for reactor graph`);
      }
    }

    this.reactor.linkNodeGraph();
  }

  public setInput(id: string, chemicals: ReactorChemicals): void {
    this.reactor.setNodeInput(id, chemicals);
  }

  public processFlowReactor() {
    this.reactor.processReactor();
    return this.reactor.getOutputs();
  }
}

export class FlowRxnModel extends Model<TYPES.FlowRxn> {
  private reactorModel?: ReactorModel;

  public addReactor(model: ReactorModel): void {
    this.reactorModel = model;
  }

  public addReactorInput(id: string, chemicals: ReactorChemicals): void {
    if (!this.reactorModel) {
      throw new Error(`No reactor model is set!`);
    }

    this.reactorModel.setInput(id, chemicals);
  }

  public processFlowRxn() {
    if (!this.reactorModel) {
      throw new Error(`No reactor model is set!`);
    }
    const output = this.reactorModel.processFlowReactor();
    this.properties.reactions = output;
  }
}
