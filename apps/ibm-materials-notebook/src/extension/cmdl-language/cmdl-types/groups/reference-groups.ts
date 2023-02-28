import { IGroup, GROUPS, GroupTypes, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

const chemical: IGroup = {
  name: GROUPS.CHEMICAL,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHEMICAL,
  description: "Create a reference to a small-molecule chemical",
  detail: "Chemical reference",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [
    PROPERTIES.SMILES,
    PROPERTIES.INCHI,
    PROPERTIES.INCHI_KEY,
    PROPERTIES.MOL_WEIGHT,
    PROPERTIES.DENSITY,
    PROPERTIES.STATE,
  ],
};

const polymer: IGroup = {
  name: GROUPS.POLYMER,
  type: GroupTypes.NAMED,
  modelType: ModelType.POLYMER,
  description:
    "Defines a polymer reference for use within an experiment record.",
  detail: "Polymer reference",
  aliases: [],
  referenceProps: [PROPERTIES.DEGREE_POLY],
  subGroups: [],
  properties: [
    PROPERTIES.BIG_SMILES,
    PROPERTIES.MN_AVG,
    PROPERTIES.MW_AVG,
    PROPERTIES.DISPERSITY,
    PROPERTIES.STATE,
    PROPERTIES.TREE,
  ],
};

const complex: IGroup = {
  name: GROUPS.COMPLEX,
  type: GroupTypes.NAMED,
  modelType: ModelType.COMPLEX,
  description: `Describes a reference of a macromolecular complex for use in experiments and assays. May consist of both polymeric and small-molecule components.`,
  detail: "Polymer complex reference",
  aliases: [],
  referenceProps: [PROPERTIES.RATIO],
  subGroups: [],
  properties: [
    PROPERTIES.CMC,
    PROPERTIES.DH,
    PROPERTIES.DH_PDI,
    PROPERTIES.LOADING_CAPACITY,
  ],
};

const component: IGroup = {
  name: GROUPS.COMPONENT,
  type: GroupTypes.NAMED,
  modelType: ModelType.COMPONENT,
  description: "Create a reference to a physical reactor component",
  detail: "Reactor component",
  aliases: [],
  referenceProps: [],
  subGroups: [],
  properties: [
    PROPERTIES.LENGTH,
    PROPERTIES.VOLUME,
    PROPERTIES.INNER_DIAMETER,
    PROPERTIES.OUTER_DIAMETER,
    PROPERTIES.DESCRIPTION,
    PROPERTIES.SOURCES,
    PROPERTIES.TARGET,
  ],
};

export const refGroups = [chemical, component, complex, polymer];
