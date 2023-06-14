import { PROPERTIES, ReactionRoles } from "../properties";
import { ModelType } from "../groups/group-types";
import { StringQty, NumericQty } from "./units";
import { Polymer } from "./polymer";
import { ChemStates } from "./reference";

export type Chemical = {
  name: string;
  type: ModelType.CHEMICAL;
  [PROPERTIES.INCHI_KEY]?: string;
  [PROPERTIES.INCHI]?: string;
  [PROPERTIES.MOL_WEIGHT]: StringQty;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.DENSITY]?: StringQty;
  [PROPERTIES.STATE]: ChemStates;
};

export type ChemicalReference = {
  name: string;
  path: string[];
  [PROPERTIES.MASS]?: StringQty;
  [PROPERTIES.MOLES]?: StringQty;
  [PROPERTIES.VOLUME]?: StringQty;
  [PROPERTIES.PRESSURE]?: StringQty;
  [PROPERTIES.ROLES]: ReactionRoles[];
  [PROPERTIES.LIMITING]?: boolean;
};

export type Fragment = {
  name: string;
  type: ModelType.FRAGMENT;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.MOL_WEIGHT]: StringQty;
};

export type ComplexReference = {
  name: string;
  path: string[];
  [PROPERTIES.RATIO]: number;
};

export type ComplexPolymer = Polymer & {
  [PROPERTIES.RATIO]: number;
};

export type ComplexChemical = Chemical & {
  [PROPERTIES.RATIO]: number;
};

export type Complex = {
  name: string;
  type: ModelType.COMPLEX;
  components: (ComplexChemical | ComplexPolymer)[];
};

export interface ChemicalOutput {
  name: string;
  mw: number | null;
  density: number | null;
  smiles: string | null;
  mass: NumericQty;
  volume: NumericQty | null;
  moles: NumericQty;
  pressure: NumericQty | null;
  ratio: number | null;
  roles: ReactionRoles[];
  molarity: NumericQty;
  molality: NumericQty;
  moles_vol: NumericQty;
  limiting: boolean;
}
