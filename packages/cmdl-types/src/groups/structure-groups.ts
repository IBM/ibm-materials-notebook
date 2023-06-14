import { IGroup, GROUPS, GroupTypes, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

const polymerFragment: IGroup = {
  name: GROUPS.FRAGMENT,
  type: GroupTypes.NAMED,
  modelType: ModelType.FRAGMENT,
  description: "polymer graph fragment",
  detail: "polymer graph fragment",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.POINT],
  properties: [PROPERTIES.SMILES, PROPERTIES.MOL_WEIGHT],
};

const polymerContainer: IGroup = {
  name: GROUPS.CONTAINER,
  type: GroupTypes.NAMED,
  modelType: ModelType.CONTAINER,
  description: "Polymer graph",
  detail: "Polymer graph",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [PROPERTIES.NODES, PROPERTIES.CONNECTIONS],
};

const polymerGraph: IGroup = {
  name: GROUPS.POLYMER_GRAPH,
  type: GroupTypes.NAMED,
  modelType: ModelType.POLYMER_GRAPH,
  description: "Polymer graph",
  detail: "Polymer graph",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.CONTAINER],
  properties: [PROPERTIES.NODES, PROPERTIES.CONNECTIONS],
};

//TODO: deprecate in favor of SMILES parser
const connectionPoint: IGroup = {
  name: GROUPS.POINT,
  type: GroupTypes.NAMED,
  modelType: ModelType.COMPONENT,
  description: "Polymer graph",
  detail: "Polymer graph",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [PROPERTIES.QUANTITY],
};

const reactorGraph: IGroup = {
  name: GROUPS.REACTOR_GRAPH,
  type: GroupTypes.NAMED,
  modelType: ModelType.REACTOR_GRAPH,
  description: "Container defining the reactor graph",
  detail: "Reactor graph",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.REACTOR, GROUPS.COMPONENT],
  properties: [],
};

const reactorGraphNode: IGroup = {
  name: GROUPS.REACTOR,
  type: GroupTypes.NAMED,
  modelType: ModelType.REACTOR,
  description:
    "hypernode in a reactor graph to define a set of components constituting one reactor",
  detail: "Reactor node",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [],
};

export const structureGroups = [
  reactorGraph,
  reactorGraphNode,
  polymerContainer,
  polymerFragment,
  polymerGraph,
  connectionPoint,
];
