import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";

// const targets: IProperty = {
//   description: "Targets for current node in a graph",
//   detail: "Node targets",
//   name: PROPERTIES.TARGETS,
//   type: PropertyTypes.REF_MULTI,
//   aliases: [],
// };

const reactor: IProperty = {
  description: "Reactor used for the flow experiment",
  detail: "Reactor reference",
  name: PROPERTIES.REACTOR,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

// const polymerGraph: IProperty = {
//   description: "Graph representation of a polymer",
//   detail: "Graph representation of a polymer",
//   name: PROPERTIES.GRAPH,
//   type: PropertyTypes.REF_SINGLE,
//   aliases: [],
// };

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

const file: IProperty = {
  description: "references an external file",
  detail: "file",
  name: PROPERTIES.FILE,
  type: PropertyTypes.REF_SINGLE,
  aliases: [],
};

export const referenceProperties = [
  // targets,
  sources,
  component,
  target,
  polymerNodes,
  connection,
  components,
  file,
  reactor,
  input,
  // polymerGraph,
];
