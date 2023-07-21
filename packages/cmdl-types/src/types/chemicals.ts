import { PROPERTIES, ReactionRoles } from "../properties";
import { ModelType } from "../groups/group-types";
import { NumericQty, BigQty, NamedQty } from "./quantities";
import { Polymer } from "./polymer";
import { BaseModel, ChemStates } from "./reference";
import Big from "big.js";

export interface Chemical extends BaseModel {
  type: ModelType.CHEMICAL;
  [PROPERTIES.INCHI_KEY]?: string;
  [PROPERTIES.INCHI]?: string;
  [PROPERTIES.MOL_WEIGHT]: BigQty;
  [PROPERTIES.SMILES]: string;
  [PROPERTIES.DENSITY]?: BigQty;
  [PROPERTIES.STATE]: ChemStates;
}

export type ChemicalReference = {
  name: string;
  path: string[];
  [PROPERTIES.MASS]?: BigQty;
  [PROPERTIES.MOLES]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.PRESSURE]?: BigQty;
  [PROPERTIES.ROLES]: ReactionRoles[];
  [PROPERTIES.LIMITING]?: boolean;
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

export interface Complex extends BaseModel {
  type: ModelType.COMPLEX;
  components: (ComplexChemical | ComplexPolymer)[];
}

export type Fragment = {
  name: string;
  value: string;
};

export interface Fragments {
  type: ModelType.FRAGMENTS;
  fragments: Fragment[];
}

export interface ChemicalOutput {
  name: string;
  mw: number | null;
  density: number | null;
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

export interface ChemicalConfig {
  name: string;
  mw: Big;
  density: Big | null;
  state: ChemStates;
  roles: ReactionRoles[];
  quantity: NamedQty;
  volume?: BigQty;
  temperature?: BigQty;
  limiting: boolean;
}
