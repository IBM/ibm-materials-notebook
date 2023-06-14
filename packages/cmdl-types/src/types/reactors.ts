import { StringQty } from "./units";
import { PROPERTIES } from "../properties";
import { Reference } from "./reference";
import { ModelType } from "../groups/group-types";

export interface ReactorNode {
  name: string;
  type: "component";
  [PROPERTIES.DESCRIPTION]?: string;
  [PROPERTIES.INNER_DIAMETER]?: StringQty;
  [PROPERTIES.OUTER_DIAMETER]?: StringQty;
  [PROPERTIES.VOLUME]?: StringQty;
  [PROPERTIES.LENGTH]?: StringQty;
  [PROPERTIES.TARGET]: Reference;
}

export interface Reactor {
  name: string;
  type: "reactor";
  [PROPERTIES.NODES]: ReactorNode[];
}

export type FlowReactor = {
  name: string;
  type: ModelType.REACTOR_GRAPH;
};
