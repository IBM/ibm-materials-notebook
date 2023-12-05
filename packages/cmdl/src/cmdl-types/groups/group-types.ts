export enum ModelType {
  CHAR_DATA = "char_data",
  CHEMICAL = "chemical",
  FRAGMENTS = "fragments",
  COMPONENT = "component",
  COMPLEX = "complex",
  CONTAINER = "container",
  FLOW_REACTION = "flow_reaction",
  POLYMER = "polymer",
  POLYMER_GRAPH = "polymer_graph",
  REACTION = "reaction",
  REACTOR_GRAPH = "reactor_graph",
  REACTOR = "reactor",
  SOLUTION = "solution",
  REFERENCE_GROUP = "reference_group",
  GROUP = "group",
}

/**
 * TODO: deprecate group types
 */
export interface IGroup {
  description: string;
  detail: string;
  name: string;
  aliases: string[];
  properties: string[];
  subGroups: string[];
  modelType?: ModelType;
  referenceProps: string[];
}

export enum GROUPS {
  //experiment metadata
  META = "metadata",
  SOURCE = "source",

  //structure
  POLYMER_GRAPH = "polymer_graph",
  CONTAINER = "container",
  FRAGMENTS = "fragments",

  //flow reactors
  REACTOR_GRAPH = "reactor_graph",
  REACTOR = "reactor",
  COMPONENT = "component",

  //named groups
  CHAR_DATA = "char_data",
  SOLUTION = "solution",
  REACTION = "reaction",
  FLOW_REACTION = "flow_reaction",
  CHEMICAL = "chemical",
  POLYMER = "polymer",
  COMPLEX = "complex",
}
