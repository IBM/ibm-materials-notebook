import { PROPERTIES } from "../properties";
import { BigQty, Export } from "./quantities";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { BaseModel, Reference, StripType } from "./reference";
import { ReactionChemicalOutput } from "./chemicals";
import { ChemicalOutput } from "./chemicals";
import { ReactorGroupExport, ReactorGroupOutput } from "./reactors";

export type Product = {
  name: string;
  smiles: string;
  [PROPERTIES.ROLES]: ReactionRoles[];
};

export interface FlowRxn extends BaseModel {
  type: ModelType.FLOW_REACTION;
  [PROPERTIES.TEMPERATURE]?: BigQty;
  reactions: ReactorGroupOutput[];
  products: Product[];
}

export type FlowRxnExport = StripType<Export<FlowRxn>> & {
  reactions: ReactorGroupExport[];
};

export type FlowRxnRender = Export<FlowRxn>;

export interface Reaction extends BaseModel {
  type: ModelType.REACTION;
  reactants: ChemicalOutput[];
  products: Product[];
  [PROPERTIES.TEMPERATURE]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.REACTION_TIME]?: BigQty;
  [PROPERTIES.PROTOCOL]?: string;
  [PROPERTIES.DATE]?: string;
}

export type ReactionExport = StripType<Export<Reaction>> & {
  reactants: ReactionChemicalOutput[];
};

export type ReactionRender = Export<Reaction> & {
  reactants: ReactionChemicalOutput[];
};

export type SolutionReference = {
  name: string;
  path: string[];
  [PROPERTIES.FLOW_RATE]: BigQty;
  [PROPERTIES.INPUT]: Reference;
};

export interface Solution extends BaseModel {
  type: ModelType.SOLUTION;
  components: ChemicalOutput[];
}

export type SolutionExport = StripType<Export<Solution>> & {
  components: ReactionChemicalOutput[];
};

export type SolutionRender = Export<Solution>;
