import { PROPERTIES } from "../properties";
import { BigQty } from "./quantities";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { Reference } from "./reference";
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

export type FlowRxn = {
  name: string;
  type: ModelType.FLOW_REACTION;
  reactions: ReactorGroupOutput[];
  products: Product[];
};

export interface Reaction {
  name: string;
  type: ModelType.REACTION;
  reactants: ChemicalOutput[];
  products: Product[];
  [PROPERTIES.TEMPERATURE]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.REACTION_TIME]?: BigQty;
  [PROPERTIES.PROTOCOL]?: string;
}

export type SolutionReference = {
  name: string;
  path: string[];
  [PROPERTIES.FLOW_RATE]: BigQty;
  [PROPERTIES.INPUT]: Reference;
};

/**
 * @deprecated
 */
export type Solution = {
  name: string;
  type: ModelType.SOLUTION;
  components: ChemicalOutput[];
  componentConfigs: ChemicalConfig[];
};
