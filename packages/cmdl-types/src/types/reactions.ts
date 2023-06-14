import { PROPERTIES } from "../properties";
import { StringQty } from "./units";
import { ModelType } from "../groups/group-types";
import { ReactionRoles } from "../properties";
import { Reference } from "./reference";
import { ChemicalOutput } from "./chemicals";

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
  [PROPERTIES.TEMPERATURE]?: StringQty;
  [PROPERTIES.VOLUME]?: StringQty;
  [PROPERTIES.REACTION_TIME]?: StringQty;
  reactants: ChemicalOutput[];
  products: Product[];
}

export type SolutionReference = {
  name: string;
  path: string[];
  [PROPERTIES.FLOW_RATE]: StringQty;
  [PROPERTIES.INPUT]: Reference;
};

export type Solution = {
  name: string;
  type: ModelType.SOLUTION;
  components: ChemicalOutput[];
  //   componentConfigs: ChemicalConfig[];
};
