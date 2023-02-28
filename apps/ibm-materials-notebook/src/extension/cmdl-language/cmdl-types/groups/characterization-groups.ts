import { IGroup, GroupTypes, GROUPS, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

const dsc: IGroup = {
  name: GROUPS.DSC,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description:
    "Differential scanning calorimetry to measure various thermal properties of a small-molecule chemical or polymeric material.",
  detail: "DSC",
  aliases: [],
  subGroups: [],
  referenceProps: [
    PROPERTIES.TEMP_CRYSTAL,
    PROPERTIES.TEMP_GLASS,
    PROPERTIES.TEMP_MELT,
  ],
  properties: [PROPERTIES.FILE],
};

const nmr: IGroup = {
  name: GROUPS.NMR,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Nuclear magnetic resonance spectroscopy",
  detail: "NMR",
  aliases: [],
  subGroups: [],
  referenceProps: [
    PROPERTIES.CONVERSION,
    PROPERTIES.YIELD,
    PROPERTIES.DEGREE_POLY,
    PROPERTIES.MN_AVG,
  ],
  properties: [PROPERTIES.FILE, PROPERTIES.NMR_NUCLEI],
};

const gc: IGroup = {
  name: GROUPS.GC,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Gas chromatography measurements of small-molecule compounds.",
  detail: "gc",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.CONVERSION, PROPERTIES.YIELD],
  properties: [PROPERTIES.FILE],
};

const ir: IGroup = {
  name: GROUPS.IR,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Infrared spectroscopy",
  detail: "ir",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.CONVERSION, PROPERTIES.YIELD],
  properties: [PROPERTIES.FILE],
};

const raman: IGroup = {
  name: GROUPS.RAMAN,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Raman spectroscopy",
  detail: "raman",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.CONVERSION, PROPERTIES.YIELD],
  properties: [PROPERTIES.FILE],
};

const uvVis: IGroup = {
  name: GROUPS.UV_VIS,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "UV-Vis spectroscopy",
  detail: "uv_vis",
  aliases: [],
  subGroups: [],
  referenceProps: [
    PROPERTIES.CONVERSION,
    PROPERTIES.YIELD,
    PROPERTIES.LOADING_CAPACITY,
  ],
  properties: [PROPERTIES.FILE],
};

const gpc: IGroup = {
  name: GROUPS.GPC,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Gel permeation chromatography",
  detail: "gpc",
  aliases: ["SEC", "size-exclusion chromatography"],
  subGroups: [],
  referenceProps: [PROPERTIES.DISPERSITY, PROPERTIES.MN_AVG, PROPERTIES.MW_AVG],
  properties: [PROPERTIES.FILE],
};

const mcPlate: IGroup = {
  name: GROUPS.MCPLATE,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Microplate reader",
  detail: "microplate_reader",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.MIC, PROPERTIES.HC50],
  properties: [PROPERTIES.FILE],
};

const fluorescence: IGroup = {
  name: GROUPS.FLUOR,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description:
    "Measurements of fluoresence properties of a polymer or chemical compound",
  detail: "fluorescence",
  aliases: [],
  subGroups: [],
  referenceProps: [
    PROPERTIES.CMC,
    PROPERTIES.LAMBDA_MAX_ABS,
    PROPERTIES.LAMBDA_MAX_EMS,
  ],
  properties: [PROPERTIES.FILE],
};

const dls: IGroup = {
  name: GROUPS.DLS,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description:
    "Measurement of polymer or complex properties using dynamic light scattering,",
  detail: "DLS",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.DH, PROPERTIES.DH_PDI, PROPERTIES.ZETA_POTENTIAL],
  properties: [PROPERTIES.FILE],
};

const hplc: IGroup = {
  name: GROUPS.HPLC,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "High performance liquid chromatography",
  detail: "hplc",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.LOADING_CAPACITY],
  properties: [PROPERTIES.FILE],
};

const analyticalBalance: IGroup = {
  name: GROUPS.ANALYTICAL_BAL,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Analytical balance",
  detail: "analytical balance",
  aliases: [],
  subGroups: [],
  referenceProps: [PROPERTIES.YIELD, PROPERTIES.MASS],
  properties: [],
};

const maldi: IGroup = {
  name: GROUPS.MALDI,
  type: GroupTypes.NAMED,
  modelType: ModelType.CHAR_DATA,
  description: "Matrix assisted laser desorption ionization spectroscopy",
  detail: "MALDI",
  aliases: [],
  subGroups: [],
  referenceProps: [],
  properties: [PROPERTIES.FILE],
};

export const sample: IGroup = {
  name: GROUPS.SAMPLE,
  type: GroupTypes.NAMED,
  modelType: ModelType.SAMPLE,
  description: "Sample for measurement of properties and results",
  detail: "Experimental sample",
  aliases: [],
  referenceProps: [],
  subGroups: [
    GROUPS.DLS,
    GROUPS.DSC,
    GROUPS.ANALYTICAL_BAL,
    GROUPS.NMR,
    GROUPS.FLUOR,
    GROUPS.UV_VIS,
    GROUPS.GC,
    GROUPS.IR,
    GROUPS.RAMAN,
    GROUPS.GPC,
    GROUPS.HPLC,
    GROUPS.MCPLATE,
    GROUPS.MALDI,
  ],
  properties: [PROPERTIES.DATE, PROPERTIES.TIME_POINT],
};

export const characterizationGroups = [
  maldi,
  analyticalBalance,
  hplc,
  dls,
  dsc,
  nmr,
  gpc,
  fluorescence,
  uvVis,
  ir,
  gc,
  raman,
  mcPlate,
  sample,
];
