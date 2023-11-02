import { ChemicalSet } from "../../cmdl-chemicals";
import { Entity, Exportable, Renderable } from "./entity";
import { ModelType, TAGS, TYPES } from "../../cmdl-types";
import { ReactorChemicals, ReactorContainer } from "../../cmdl-reactors";
import { ActivationRecord } from "../model-AR";
import { ChemicalTranslator } from "./utils";
import { ChemicalEntity } from "./chemicals";
import { PolymerEntity } from "./polymer";
import { convertQty } from "../../cmdl-units";

interface ChemicalContainer {
  entities: Record<string, ChemicalEntity | PolymerEntity>;
}

export class ReactionEntity
  extends Entity<TYPES.Reaction>
  implements ChemicalContainer, Exportable, Renderable
{
  private chemicals = new ChemicalSet();
  entities = {} as Record<string, ChemicalEntity | PolymerEntity>;

  private addEntity(entity: ChemicalEntity | PolymerEntity): void {
    if (!(entity.name in this.entities)) {
      this.entities[entity.name] = entity;
    }
  }

  public insertChemicals(
    chemRefs: TYPES.ChemicalReference[],
    globalAR: ActivationRecord
  ) {
    const products: TYPES.Product[] = [];
    for (const chemRef of chemRefs) {
      const parentEntity = globalAR.getValue<PolymerEntity | ChemicalEntity>(
        chemRef.name
      );
      this.addEntity(parentEntity);

      if (!chemRef.roles.includes(TAGS.PRODUCT)) {
        const chemConfig = ChemicalTranslator.createChemicalConfig({
          chemical: chemRef,
          configValues: parentEntity.getConfigValues(),
          volume: this.properties.volume,
          temperature: this.properties.temperature,
        });
        this.chemicals.insert(chemConfig);
      } else {
        products.push(chemRef);
      }
    }
    this.add("products", products);
  }

  public getReactionValues(): TYPES.ChemicalOutput[] {
    return this.chemicals.computeChemicalValues();
  }

  public export(): TYPES.ReactionExport {
    this.chemicals.computeChemicalValues();

    const chemOutput: TYPES.ReactionChemicalOutput[] =
      this.chemicals.chemicalValues.map((el) => {
        return {
          ...el,
          entity: this.entities[el.name].export(),
        };
      });

    return {
      ...this.properties,
      volume: this.properties.volume
        ? convertQty(this.properties.volume)
        : undefined,
      temperature: this.properties.temperature
        ? convertQty(this.properties.temperature)
        : undefined,
      reaction_time: this.properties.reaction_time
        ? convertQty(this.properties.reaction_time)
        : undefined,
      name: this.name,
      reactants: chemOutput,
    };
  }

  public render(): TYPES.ReactionRender {
    return {
      ...this.export(),
      type: ModelType.REACTION,
    };
  }
}

export class SolutionEntity
  extends Entity<TYPES.Solution>
  implements ChemicalContainer, Exportable
{
  private chemicals = new ChemicalSet();
  entities = {} as Record<string, ChemicalEntity | PolymerEntity>;

  private addEntity(entity: ChemicalEntity | PolymerEntity): void {
    if (!(entity.name in this.entities)) {
      this.entities[entity.name] = entity;
    }
  }

  public insertChemicals(
    chemRefs: TYPES.ChemicalReference[],
    globalAR: ActivationRecord
  ) {
    for (const chemRef of chemRefs) {
      const parentEntity = globalAR.getValue<PolymerEntity | ChemicalEntity>(
        chemRef.name
      );
      this.addEntity(parentEntity);

      if (!chemRef.roles.includes(TAGS.PRODUCT)) {
        const chemConfig = ChemicalTranslator.createChemicalConfig({
          chemical: chemRef,
          configValues: parentEntity.getConfigValues(),
        });
        this.chemicals.insert(chemConfig);
      }
    }
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

export class ReactorEntity extends Entity<TYPES.Reactor> {
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

export class FlowRxnEntity extends Entity<TYPES.FlowRxn> {
  private reactorModel?: ReactorEntity;

  public addReactor(model: ReactorEntity): void {
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
