import { IGroup, GROUPS } from "./group-types";
import { PROPERTIES } from "../properties";

/**
 * TODO: Deprecate record_id, template, owner, name
 */
const metadata: IGroup = {
  name: GROUPS.META,
  description: "Metadata definition for the notebook document",
  detail: "Exp. Metadata",
  aliases: [],
  referenceProps: [],
  subGroups: [GROUPS.SOURCE],
  properties: [
    PROPERTIES.TITLE,
    PROPERTIES.NAME,
    PROPERTIES.DATE,
    PROPERTIES.TAGS,
    PROPERTIES.EXP_ID,
  ],
};

//TODO: available only in manifest file
//?deprecated
const source: IGroup = {
  name: GROUPS.SOURCE,
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

// const protocol: IGroup = {
//   name: GROUPS.PROTOCOL,
//   modelType: ModelType.PROTOCOL,
//   description:
//     "Protocol template for an experiment or characterization measurement",
//   detail: "Protocol",
//   aliases: [],
//   referenceProps: [],
//   subGroups: [],
//   properties: [],
// };

export const exprimentGroups = [metadata, source];
