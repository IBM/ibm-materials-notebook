import { IGroup, GROUPS, GroupTypes, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

//TODO: Convert to named group
const experiment: IGroup = {
  name: GROUPS.META,
  type: GroupTypes.UNAMED,
  description: "Metadata definition for the notebook document",
  detail: "Exp. Metadata",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.SOURCE],
  properties: [
    PROPERTIES.TITLE,
    PROPERTIES.NAME,
    PROPERTIES.DATE,
    PROPERTIES.OWNER,
    PROPERTIES.TEMPLATE,
    PROPERTIES.TAGS,
    PROPERTIES.RECORD_ID,
    PROPERTIES.EXP_ID,
  ],
};

//TODO: available only in manifest file
const source: IGroup = {
  name: GROUPS.SOURCE,
  type: GroupTypes.UNAMED,
  description:
    "Describes a journal article or notebook source for a particular experiment record.",
  detail: "Journal article",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [
    PROPERTIES.TITLE,
    PROPERTIES.DATE,
    PROPERTIES.SOURCE_TYPE,
    PROPERTIES.DOI,
    PROPERTIES.CITATION,
  ],
};

const protocol: IGroup = {
  name: GROUPS.PROTOCOL,
  type: GroupTypes.NAMED,
  modelType: ModelType.PROTOCOL,
  description:
    "Protocol template for an experiment or characterization measurement",
  detail: "Protocol",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [],
};

export const exprimentGroups = [experiment, source, protocol];
