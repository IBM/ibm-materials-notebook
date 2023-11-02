import { IGroup, GROUPS, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

/**
 * ?: Assignment properties will move to global scope for file
 */
const polymerFragment: IGroup = {
  name: GROUPS.FRAGMENTS,
  modelType: ModelType.FRAGMENTS,
  description: "SMILES fragments for polymer graph",
  detail: "Polymer graph fragments",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [PROPERTIES.FRAGMENT],
};

const polymerContainer: IGroup = {
  name: GROUPS.CONTAINER,
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
  modelType: ModelType.POLYMER_GRAPH,
  description: "Contains base structural information for a given polymer type",
  detail: "Polymer structure group",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.CONTAINER],
  properties: [PROPERTIES.BIG_SMILES, PROPERTIES.NODES, PROPERTIES.CONNECTIONS],
};

const reactorGraph: IGroup = {
  name: GROUPS.REACTOR_GRAPH,
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
];
