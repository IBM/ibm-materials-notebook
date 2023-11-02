import { IGroup, GROUPS, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

export const reaction: IGroup = {
  name: GROUPS.REACTION,
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
    PROPERTIES.STATE,
    PROPERTIES.LIMITING,
  ],
  subGroups: [],
  properties: [
    PROPERTIES.DATE,
    PROPERTIES.TEMPERATURE,
    PROPERTIES.VOLUME,
    PROPERTIES.REACTION_TIME,
    PROPERTIES.PROTOCOL,
  ],
};

/**
 * TODO: merge with reaction group?
 */
export const flowRection: IGroup = {
  name: GROUPS.FLOW_REACTION,
  modelType: ModelType.FLOW_REACTION,
  description: "Flow reaction group",
  detail: "Flow reaction",
  aliases: [],
  referenceProps: [PROPERTIES.INPUT, PROPERTIES.FLOW_RATE, PROPERTIES.ROLES],
  subGroups: [],
  properties: [
    PROPERTIES.DATE,
    PROPERTIES.REACTOR,
    PROPERTIES.TEMPERATURE,
    PROPERTIES.COLLECTION_TIME,
  ],
};

export const solution: IGroup = {
  name: GROUPS.SOLUTION,
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

export const chemicalGroups = [reaction, flowRection, solution];
