export enum GroupTypes {
  NAMED = "NAMED",
  UNAMED = "UNAMED",
}

export enum ModelType {
  CHAR_DATA = "char_data",
  CHEMICAL = "chemical",
  FRAGMENT = "fragment",
  COMPONENT = "component",
  COMPLEX = "complex",
  CONTAINER = "container",
  FLOW_REACTION = "flow_reaction",
  POLYMER = "polymer",
  POLYMER_GRAPH = "polymer_graph",
  PROTOCOL = "protocol",
  REACTION = "reaction",
  REACTOR_GRAPH = "reactor_graph",
  REACTOR = "reactor",
  SOLUTION = "solution",
  REFERENCE_GROUP = "reference_group",
  GROUP = "group",
}

export interface IGroup {
  description: string;
  detail: string;
  type: GroupTypes;
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
  STRUCTURE = "structure",
  POLYMER_GRAPH = "polymer_graph",
  CONTAINER = "container", //named
  FRAGMENT = "fragment", //named

  //flow reactors
  REACTOR_GRAPH = "reactor_graph",
  REACTOR = "reactor", //named
  COMPONENT = "component", //named

  //named groups
  CHAR_DATA = "char_data",
  SOLUTION = "solution",
  REACTION = "reaction",
  FLOW_REACTION = "flow_reaction",
  ASSAY = "assay",
  CHEMICAL = "chemical",
  POLYMER = "polymer",
  COMPLEX = "complex",
  ORGANISM = "organism",
  REFERENCE = "reference",
  POINT = "point",
  PROTOCOL = "protocol",
}
