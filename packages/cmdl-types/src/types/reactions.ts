import { PROPERTIES } from "../properties";
import { BigQty } from "./quantities";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { Reference } from "./reference";
import { ChemicalOutput, ChemicalConfig } from "./chemicals";

type ComplexComponents = {
  name: string;
  [PROPERTIES.SMILES]: string;
};

export type Product = {
  name: string;
  [PROPERTIES.SMILES]?: string | null;
  [PROPERTIES.ROLES]: ReactionRoles[];
  components?: ComplexComponents[];
};

export type FlowRxn = {
  name: string;
  type: ModelType.FLOW_REACTION;
  //   reactions: ReactorGroupOutput[];
  products: Product[];
};

export interface Reaction {
  name: string;
  type: ModelType.REACTION;
  [PROPERTIES.TEMPERATURE]: BigQty | null;
  [PROPERTIES.VOLUME]: BigQty | null;
  [PROPERTIES.REACTION_TIME]?: BigQty;
  reactants: ChemicalOutput[];
  products: Product[];
}

export type SolutionReference = {
  name: string;
  path: string[];
  [PROPERTIES.FLOW_RATE]: BigQty;
  [PROPERTIES.INPUT]: Reference;
};

export type Solution = {
  name: string;
  type: ModelType.SOLUTION;
  components: ChemicalOutput[];
  componentConfigs: ChemicalConfig[];
};
