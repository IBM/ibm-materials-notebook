import { IGroup, GROUPS, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

const chemical: IGroup = {
  name: GROUPS.CHEMICAL,
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
    PROPERTIES.TEMP_MELT,
    PROPERTIES.TEMP_BOILING,
    PROPERTIES.TEMP_SUBLIME,
    PROPERTIES.ALIASES,
  ],
};

const polymer: IGroup = {
  name: GROUPS.POLYMER,
  modelType: ModelType.POLYMER,
  description:
    "Defines a polymer reference for use within an experiment record.",
  detail: "Polymer reference",
  aliases: [],
  referenceProps: [PROPERTIES.DEGREE_POLY],
  subGroups: [],
  properties: [
    PROPERTIES.TAGS,
    PROPERTIES.MN_AVG,
    PROPERTIES.MW_AVG,
    PROPERTIES.DISPERSITY,
    PROPERTIES.STRUCTURE,
  ],
};

const complex: IGroup = {
  name: GROUPS.COMPLEX,
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
