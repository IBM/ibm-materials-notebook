import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";

const reactor: IProperty = {
  description: "Reactor used for the flow experiment",
  detail: "Reactor reference",
  name: PROPERTIES.REACTOR,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

const input: IProperty = {
  description: "Reactor input node for a stock solution",
  detail: "Reactor input reference",
  name: PROPERTIES.INPUT,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

const polymerNodes: IProperty = {
  description: "Nodes for a polymer container",
  detail: "polymer nodes",
  name: PROPERTIES.NODES,
  type: PropertyTypes.REF_MULTI,
  aliases: [],
};

const target: IProperty = {
  description: "Targets for current node in a graph",
  detail: "Node targets",
  name: PROPERTIES.TARGET,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

const sources: IProperty = {
  description: "Targets for current node in a graph",
  detail: "Node targets",
  name: PROPERTIES.SOURCES,
  type: PropertyTypes.REF_MULTI,
  aliases: [],
};

const source: IProperty = {
  description: "Source of characterization data",
  detail: "Characterization source",
  name: PROPERTIES.SOURCE,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

const component: IProperty = {
  description: "Targets for current node in a graph",
  detail: "Node targets",
  name: PROPERTIES.COMPONENT,
  type: PropertyTypes.REF_MULTI,
  aliases: [],
};

const components: IProperty = {
  description: "Component containers in a polymer graph",
  detail: "Graph components",
  name: PROPERTIES.COMPONENTS,
  type: PropertyTypes.REF_MULTI,
  aliases: [],
};

const connection: IProperty = {
  description: "connections for a polymer graph",
  detail: "polymer graph connections",
  name: PROPERTIES.CONNECTIONS,
  type: PropertyTypes.REF_MULTI,
  aliases: [],
};

const fragment: IProperty = {
  description: "Create fragment elements for polymer graph",
  detail: "Fragment for polymer graph",
  name: PROPERTIES.FRAGMENT,
  type: PropertyTypes.ASSIGNMENT,
  aliases: [],
};

const file: IProperty = {
  description: "references an external file",
  detail: "file",
  name: PROPERTIES.FILE,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

const protocol: IProperty = {
  description: "references a protocol",
  detail: "protocol",
  name: PROPERTIES.PROTOCOL,
  type: PropertyTypes.REF_SINGLE,
  aliases: ["proceedure"],
};

const structure: IProperty = {
  description: "Structure of a polymeric material",
  detail: "structure",
  name: PROPERTIES.STRUCTURE,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

export const referenceProperties = [
  sources,
  component,
  target,
  polymerNodes,
  connection,
  components,
  file,
  fragment,
  reactor,
  input,
  protocol,
  structure,
  source,
];
