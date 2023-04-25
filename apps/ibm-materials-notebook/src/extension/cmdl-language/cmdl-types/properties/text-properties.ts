import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";

const name: IProperty = {
  description: "Name for expriment element (reaction, reactor, solution, etc.)",
  detail: "name",
  name: PROPERTIES.NAME,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const aliases: IProperty = {
  description: "aliases for a chemical or material",
  detail: "aliases",
  name: PROPERTIES.ALIASES,
  type: PropertyTypes.LIST,
  aliases: [],
};

const description: IProperty = {
  description: "short description of item",
  detail: "description",
  name: PROPERTIES.DESCRIPTION,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const title: IProperty = {
  description: "Title of experiment, record, journal, or notebook",
  detail: "title",
  name: PROPERTIES.TITLE,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const owner: IProperty = {
  description: "Owner of experiment or record",
  detail: "owner",
  name: PROPERTIES.OWNER,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const doi: IProperty = {
  description: "Digitial object identifier",
  detail: "doi",
  name: PROPERTIES.DOI,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const citation: IProperty = {
  description: "Journal article citation",
  detail: "citation",
  name: PROPERTIES.CITATION,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const expID: IProperty = {
  description: "Id for experiment",
  detail: "sampleID",
  name: PROPERTIES.EXP_ID,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const date: IProperty = {
  description: "Date for experiment, characterization data, etc.",
  detail: "date",
  name: PROPERTIES.DATE,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const smiles: IProperty = {
  description: "SMILES line notation",
  detail: "SMILES",
  name: PROPERTIES.SMILES,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const bigSmiles: IProperty = {
  description: "BigSMILES line notation",
  detail: "BigSMILES",
  name: PROPERTIES.BIG_SMILES,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const inchi: IProperty = {
  description: "InChi string representation",
  detail: "InChi",
  name: PROPERTIES.INCHI,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const inchiKey: IProperty = {
  description: "InChi key",
  detail: "InChi Key",
  name: PROPERTIES.INCHI_KEY,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const recordId: IProperty = {
  description: "Record Id",
  detail: "Record Id",
  name: PROPERTIES.RECORD_ID,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const refId: IProperty = {
  description: "Reference Id",
  detail: "Reference Id",
  name: PROPERTIES.REF_ID,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const tree: IProperty = {
  description: "Polymer tree",
  detail: "Polymer tree",
  name: PROPERTIES.TREE,
  type: PropertyTypes.TEXT,
  aliases: [],
};

const limiting: IProperty = {
  description: "Sets the limiting reagent in a reaction",
  detail: "limiting reagent",
  name: PROPERTIES.LIMITING,
  type: PropertyTypes.BOOLEAN,
  aliases: [],
};

export const textProperties = [
  name,
  smiles,
  bigSmiles,
  inchi,
  inchiKey,
  date,
  expID,
  doi,
  citation,
  title,
  owner,
  description,
  tree,
  recordId,
  limiting,
  refId,
  aliases,
];
