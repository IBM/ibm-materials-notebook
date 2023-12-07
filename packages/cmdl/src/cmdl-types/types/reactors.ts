import { BigQty, Export, NumericQty } from "./quantities";
import { PROPERTIES } from "../properties";
import { BaseModel, Reference } from "./reference";
import { ModelType } from "../groups/group-types";
import { ChemicalOutput, ReactionChemicalOutput } from "./chemicals";

export interface ReactorNode {
  name: string;
  type: "component";
  [PROPERTIES.DESCRIPTION]?: string;
  [PROPERTIES.INNER_DIAMETER]?: BigQty;
  [PROPERTIES.OUTER_DIAMETER]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.LENGTH]?: BigQty;
  [PROPERTIES.TARGET]?: Reference;
}

export interface Reactor {
  name: string;
  type: "reactor";
  components: ReactorNode[];
}

export interface FlowReactor extends BaseModel {
  type: ModelType.REACTOR_GRAPH;
}

export interface ReactorGroupOutput {
  name: string;
  flowRate: NumericQty;
  residenceTime: NumericQty;
  volume: NumericQty;
  reactants: ChemicalOutput[];
}

export type ReactorGroupExport = Export<ReactorGroupOutput> & {
  reactants: ReactionChemicalOutput[];
};
