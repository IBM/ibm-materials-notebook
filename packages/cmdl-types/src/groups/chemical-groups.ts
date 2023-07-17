import { IGroup, GROUPS, GroupTypes, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

export const reaction: IGroup = {
  name: GROUPS.REACTION,
  type: GroupTypes.NAMED,
  modelType: ModelType.REACTION,
  description: "Reaction group",
  detail: "Reaction",
  aliases: [],
  referenceProps: [
    PROPERTIES.MASS,
    PROPERTIES.VOLUME,
    PROPERTIES.MOLES,
    PROPERTIES.PRESSURE,
    PROPERTIES.ROLES,
    PROPERTIES.LIMITING,
  ],
  subGroups: [],
  properties: [
    PROPERTIES.TEMPERATURE,
    PROPERTIES.VOLUME,
    PROPERTIES.REACTION_TIME,
    PROPERTIES.PROTOCOL,
  ],
};

export const assay: IGroup = {
  name: GROUPS.ASSAY,
  type: GroupTypes.NAMED,
  description: "Assay chemicals",
  detail: "Assay chemicals",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [],
};

export const flowRection: IGroup = {
  name: GROUPS.FLOW_REACTION,
  type: GroupTypes.NAMED,
  modelType: ModelType.FLOW_REACTION,
  description: "Flow reaction group",
  detail: "Flow reaction",
  aliases: [],
  referenceProps: [PROPERTIES.INPUT, PROPERTIES.FLOW_RATE, PROPERTIES.ROLES],
  subGroups: [],
  properties: [
    PROPERTIES.REACTOR,
    PROPERTIES.TEMPERATURE,
    PROPERTIES.COLLECTION_TIME,
  ],
};

export const stockSolution: IGroup = {
  name: GROUPS.SOLUTION,
  type: GroupTypes.NAMED,
  modelType: ModelType.SOLUTION,
  description:
    "Describes a stock solution of reagents for use in a flow reaction.",
  detail: "Stock solution",
  aliases: [],
  referenceProps: [
    PROPERTIES.MASS,
    PROPERTIES.VOLUME,
    PROPERTIES.MOLES,
    PROPERTIES.PRESSURE,
    PROPERTIES.ROLES,
    PROPERTIES.LIMITING,
  ],
  subGroups: [],
  properties: [],
};

export const chemicalGroups = [reaction, flowRection, stockSolution, assay];
