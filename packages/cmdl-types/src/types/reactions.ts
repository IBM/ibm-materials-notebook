import { PROPERTIES } from "../properties";
import { BigQty, Export } from "./quantities";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { BaseModel, Reference } from "./reference";
import { ReactionChemicalOutput } from "./chemicals";
import { ChemicalOutput } from "./chemicals";
import { ReactorGroupOutput } from "./reactors";

type ComplexComponents = {
  name: string;
};

export type Product = {
  name: string;
  [PROPERTIES.ROLES]: ReactionRoles[];
  components?: ComplexComponents[];
};

/**
 * TODO: add temperature
 */
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
  [PROPERTIES.DATE]?: string;
}

export type ReactionExport = Export<Reaction> & {
  reactants: ReactionChemicalOutput[];
};

// export type ReactionExport = StripType<Export<Reaction>>;

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
