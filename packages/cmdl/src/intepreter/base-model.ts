import { ModelActivationRecord } from "./model-AR";
import { PROPERTIES, ModelType, TYPES, TAGS } from "cmdl-types";
import { PolymerContainer } from "cmdl-polymers";
import Big from "big.js";
import { ChemicalSet } from "cmdl-chemicals";
import { ReactorChemicals, ReactorContainer } from "cmdl-reactors";
import { logger } from "../logger";

export interface Clonable {
  clone(): this;
}

type EntityConfigValues = {
  mw: Big;
  density?: Big;
  state: TYPES.ChemStates;
};

interface ChemicalEntity {
  getConfigValues(): EntityConfigValues;
}

export interface Exportable<T> {
  export(): T;
}

export class Model<T> implements Clonable, Exportable<T> {
  protected readonly properties: T = {} as T;

  constructor(public name: string, public type: string) {}

  public add<K extends keyof T>(key: K, value: T[K]): void {
    this.properties[key] = value;
  }

  public clone(): this {
    const clone = Object.create(this);
    return clone;
  }

  public export(): T {
    return { ...this.properties, name: this.name, type: this.type };
  }
}

export class ChemicalModel
  extends Model<TYPES.Chemical>
  implements ChemicalEntity
{
  public getConfigValues(): EntityConfigValues {
    if (!this.properties.molecular_weight || !this.properties.state) {
      throw new Error(`No molecular weight or state defined for ${this.name}`);
    }
    return {
      mw: this.properties.molecular_weight.value,
      density: this.properties.density?.value,
      state: this.properties.state,
    };
  }
}

export class ComplexModel extends Model<TYPES.Complex> {}
export class FramgentModel extends Model<TYPES.Fragment> {
  public getNodeValues() {
    return {
      smiles: this.properties.smiles,
      mw: this.properties.molecular_weight.value,
      fragment: this.name,
    };
  }
}

export class PolymerGraphModel extends Model<TYPES.PolymerGraph> {
  private graph = new PolymerContainer(this.name);

  public clone(): this {
    const clone = Object.create(this);
    clone.graph = Object.create(this.graph);
    return clone;
  }

  public initializePolymerGraph(
    treeConfig: TYPES.PolymerContainer,
    record: ModelActivationRecord
  ): void {
    const queue: TYPES.PolymerContainer[] = [treeConfig];
    let curr: TYPES.PolymerContainer | undefined;

    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      const container = this.graph.createPolymerContainer(curr.name);

      for (const node of curr.nodes) {
        const fragment = record.getValue<FramgentModel>(node.ref.slice(1));
        const entity = this.graph.createPolymerNode(fragment.getNodeValues());
        container.add(entity);
      }

      if (curr?.connections) {
        for (const conn of curr.connections) {
          this.graph.createPolymerEdges(conn, container);
        }

        if (curr?.containers?.length) {
          for (const cont of curr.containers) {
            cont.parent = curr.name;
            queue.unshift(cont);
          }
        }
      }

      this.graph.insertContainer(container, curr?.parent);
    }
    this.graph.build();
  }

  public printTree() {
    return this.graph.tree.print();
  }

  public insertNodeProperties(values: TYPES.PolymerTreeValue[]): void {
    this.graph.addGraphValues(values);
    this.graph.computePolymerWeights();
  }

  public getGraphSmiles() {
    return this.graph.getSmilesStr();
  }

  public export() {
    return {
      smiles: this.graph.getSmilesStr(),
      str: this.graph.graphToString(),
      name: this.name,
      type: this.type as ModelType.POLYMER_GRAPH,
    };
  }
}

export class PolymerModel
  extends Model<TYPES.Polymer>
  implements ChemicalEntity
{
  private graph?: PolymerGraphModel;

  public clone(): this {
    const clone = Object.create(this);
    if (this.graph) {
      const cloneGraph = this.graph.clone();
      clone.addGraph(cloneGraph);
    }
    return clone;
  }

  public addGraph(graph: PolymerGraphModel): void {
    this.graph = graph;
  }

  public embedNodeValues(values: TYPES.PolymerTreeValue[]) {
    if (!this.graph) {
      throw Error(`polymer graph is undefined on ${this.name}`);
    }
    this.graph.insertNodeProperties(values);
  }

  public getConfigValues(): EntityConfigValues {
    if (!this.properties.state) {
      throw new Error(`Mn or state is undefined on ${this.name}`);
    }

    if (!!this.properties.mn_avg) {
      logger.warn(`Mn is not defined for ${this.name}...returning value of 1`);
    }

    return {
      mw: this.properties.mn_avg?.value || Big(1),
      state: this.properties.state,
    };
  }

  public export(): TYPES.Polymer {
    const graphExport = this.graph?.export();
    return {
      ...this.properties,
      smiles: graphExport?.smiles || "",
      name: this.name,
      type: this.type as ModelType.POLYMER,
    };
  }
}

export class ReactionModel extends Model<TYPES.Reaction> {
  private chemicals = new ChemicalSet();

  public insertChemicals(
    chemRefs: TYPES.ChemicalReference[],
    globalAR: ModelActivationRecord
  ) {
    logger.debug(`chemical refs:}`, { meta: chemRefs });
    const chemConfigs = ChemicalTranslator.createChemicalConfigs(
      chemRefs,
      globalAR,
      {
        volume: this.properties.volume,
        temperature: this.properties.temperature,
      }
    );
    logger.debug(`chemical configs:}`, { meta: chemConfigs });
    this.chemicals.insertMany(chemConfigs);
  }

  public computeValues() {
    this.chemicals.computeChemicalValues();
  }

  public export(): TYPES.Reaction {
    this.chemicals.computeChemicalValues();
    return {
      ...this.properties,
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
  }

  public getChemicalConfigs(): TYPES.ChemicalConfig[] {
    return this.chemicals.exportSet();
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

  public processReactor() {
    this.processReactor();
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
    const output = this.reactorModel.processReactor();
    this.properties.reactions = output;
  }
}

export class ResultModel extends Model<TYPES.Result> implements ChemicalEntity {
  private chemicalEntity: PolymerModel | ChemicalModel;

  constructor(
    name: string,
    type: string,
    entity: PolymerModel | ChemicalModel
  ) {
    super(name, type);
    this.chemicalEntity = entity;
  }

  get resultName() {
    return `${this.name}-${this.properties.sample_id}`;
  }

  public clone() {
    const clone = Object.create(this);
    clone.chemicalEntity = this.chemicalEntity.clone();
    return clone;
  }

  public addMeasuredProperty(
    key: keyof TYPES.MeasuredData,
    value: TYPES.MeasuredData[keyof TYPES.MeasuredData]
  ) {
    const currentValues = this.properties[key];
    if (currentValues) {
      this.properties[key] = [...currentValues, value];
    } else {
      this.properties[key] = [value];
    }
  }

  public getConfigValues(): EntityConfigValues {
    if (this.chemicalEntity instanceof ChemicalModel) {
      return this.chemicalEntity.getConfigValues();
    }

    const polymerValues = this.chemicalEntity.getConfigValues();
    const measuredMn = this.selectPolymerMn();
    logger.debug(`Selected Mn: ${measuredMn}`);

    return { ...polymerValues, mw: measuredMn };
  }

  private selectPolymerMn(): Big {
    if (!this.properties.mn_avg) {
      throw new Error(`No Mn defined for ${this.resultName}!`);
    }

    if (this.properties.mn_avg.length === 1) {
      return this.properties.mn_avg[0].value;
    }

    const nmrMn = this.properties.mn_avg.filter(
      (el) => el.technique === TAGS.NMR
    );
    const gpcMn = this.properties.mn_avg.filter(
      (el) => el.technique === TAGS.GPC
    );

    if (nmrMn.length) {
      return nmrMn[0].value;
    } else if (gpcMn.length) {
      return gpcMn[0].value;
    } else {
      throw new Error(`unable to find valid Mn for ${this.resultName}`);
    }
  }
}

export class CharDataModel extends Model<TYPES.CharDataOutput> {}

export class ChemicalTranslator {
  /**
   * Method for examining the CMDLChemicalReference and determining the quantity type
   * for a chemical. Returns the quantity reformatted for stoichiometry calculations.
   * @param ref CMDLChemicalRefrerence
   * @returns NamedQuantity
   */
  static extractQuantity(ref: TYPES.ChemicalReference): TYPES.NamedQty {
    let name: TYPES.QuantityNames;
    if (ref?.mass) {
      return {
        name: PROPERTIES.MASS,
        value: Big(ref.mass.value),
        unit: ref.mass.unit,
        uncertainty: ref.mass?.uncertainty ? Big(ref.mass.uncertainty) : null,
      };
    } else if (ref?.volume) {
      return {
        name: PROPERTIES.VOLUME,
        value: Big(ref.volume.value),
        unit: ref.volume.unit,
        uncertainty: ref.volume?.uncertainty
          ? Big(ref.volume.uncertainty)
          : null,
      };
    } else if (ref?.moles) {
      return {
        name: PROPERTIES.MOLES,
        value: Big(ref.moles.value),
        unit: ref.moles.unit,
        uncertainty: ref.moles?.uncertainty ? Big(ref.moles.uncertainty) : null,
      };
    } else if (ref?.pressure) {
      return {
        name: PROPERTIES.PRESSURE,
        value: Big(ref.pressure.value),
        unit: ref.pressure.unit,
        uncertainty: ref.pressure?.uncertainty
          ? Big(ref.pressure.uncertainty)
          : null,
      };
    } else {
      throw new Error(`Quantity is unavailable for ${ref.name}!`);
    }
  }

  static createChemicalConfigs(
    chemicals: TYPES.ChemicalReference[],
    globalAR: ModelActivationRecord,
    params?: { volume?: TYPES.BigQty | null; temperature?: TYPES.BigQty | null }
  ): TYPES.ChemicalConfig[] {
    let configs: TYPES.ChemicalConfig[] = [];
    logger.verbose(`globalAR:\n\n${globalAR.print()}`);
    for (const chemical of chemicals) {
      let parentModel = globalAR.getValue<ChemicalEntity>(chemical.name);

      const quantity = this.extractQuantity(chemical);
      const configValues = parentModel.getConfigValues();

      logger.debug(`config values:`, { meta: configValues });

      const chemicalConfig: TYPES.ChemicalConfig = {
        name: chemical.name,
        mw: configValues.mw,
        density: configValues.density || null,
        state: configValues.state,
        roles: chemical.roles,
        temperature: params?.temperature || undefined,
        volume: params?.volume || undefined,
        limiting: chemical?.limiting ? true : false,
        quantity,
      };

      if (
        chemicalConfig.state === TYPES.ChemStates.LIQUID &&
        !chemicalConfig.density &&
        chemicalConfig.quantity.name === PROPERTIES.VOLUME
      ) {
        throw new Error(
          `Liquid chemical: ${this.name} has invalid density and a volume quantity`
        );
      }

      if (
        chemicalConfig.state === TYPES.ChemStates.GAS &&
        chemicalConfig.quantity.name !== PROPERTIES.PRESSURE
      ) {
        throw new Error(
          `Pressure should be used as a quantity for gas reagent ${this.name}`
        );
      }

      configs.push(chemicalConfig);
    }

    return configs;
  }
}
/**
 * Base class for interpreter models
 *
 */
export abstract class BaseModel {
  constructor(
    public name: string,
    public modelAR: ModelActivationRecord,
    public type: ModelType
  ) {}

  /**
   * Method to execute model for computation or tabulation of properties.
   * Writes values to parent activation record.
   * @param globalAR ModelActivationRecord
   */
  abstract execute(globalAR: ModelActivationRecord): void;
}
