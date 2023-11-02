import { TAGS, ITag } from "./tag-types";

const polymerization: ITag = {
  description: "Polymerization",
  detail: "Polymerization",
  name: TAGS.POLYMERIZATION,
  aliases: [],
};
const bulkPolymerization: ITag = {
  description: "Bulk polymerization",
  detail: "Bulk polymerization",
  name: TAGS.BULK_POLYMERIZATION,
  aliases: [],
};
const rop: ITag = {
  description: "Ring-opening polymerization",
  detail: "Ring-opening polymerization",
  name: TAGS.ROP,
  aliases: [],
};
const zrop: ITag = {
  description: "Zwitterionic ring-opening polymerization",
  detail: "Zwitterionic ring-opening polymerization",
  name: TAGS.ZROP,
  aliases: [],
};
const romp: ITag = {
  description: "ROMP polymerization",
  detail: "ROMP polymerization",
  name: TAGS.ROMP,
  aliases: [],
};
const postPolyFunc: ITag = {
  description: "Post-polymerization modification",
  detail: "Post-polymerization modification",
  name: TAGS.POST_POLY_FUNC,
  aliases: [],
};

const chainExtension: ITag = {
  description: "Chain extension",
  detail: "Chain extension",
  name: TAGS.CHAIN_EXTENSION,
  aliases: [],
};

export const techniqueTags = [
  bulkPolymerization,
  rop,
  zrop,
  romp,
  postPolyFunc,
  chainExtension,
  polymerization,
];
