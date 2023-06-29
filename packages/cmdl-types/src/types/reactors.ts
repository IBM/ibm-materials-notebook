import { BigQty } from "./quantities";
import { PROPERTIES } from "../properties";
import { Reference } from "./reference";
import { ModelType } from "../groups/group-types";

export interface ReactorNode {
  name: string;
  type: "component";
  [PROPERTIES.DESCRIPTION]?: string;
  [PROPERTIES.INNER_DIAMETER]?: BigQty;
  [PROPERTIES.OUTER_DIAMETER]?: BigQty;
  [PROPERTIES.VOLUME]?: BigQty;
  [PROPERTIES.LENGTH]?: BigQty;
  [PROPERTIES.TARGET]: Reference;
}

export interface Reactor {
  name: string;
  type: "reactor";
  components: ReactorNode[];
}

export type FlowReactor = {
  name: string;
  type: ModelType.REACTOR_GRAPH;
};
