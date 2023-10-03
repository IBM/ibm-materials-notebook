import { PROPERTIES } from "../properties";
import { BigQty, Export } from "./quantities";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { BaseModel, Reference, StripType } from "./reference";
import { ChemicalOutput, ChemicalConfig } from "./chemicals";
import { ReactorGroupOutput } from "./reactors";

type ComplexComponents = {
  name: string;
};

export type Product = {
  name: string;
  [PROPERTIES.ROLES]: ReactionRoles[];
  components?: ComplexComponents[];
};

export interface FlowRxn extends BaseModel {
  type: ModelType.FLOW_REACTION;
  reactions: ReactorGroupOutput[];
  products: Product[];
}

export interface Reaction extends BaseModel {
  type: ModelType.REACTION;
  reactants: ChemicalOutput[];
  products: Product[];
  [PROPERTIES.TEMPERATURE]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.REACTION_TIME]?: BigQty;
  [PROPERTIES.PROTOCOL]?: string;
}

export type ReactionExport = StripType<Export<Reaction>>;

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
