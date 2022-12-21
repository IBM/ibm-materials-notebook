import { TAGS, ITag } from "./tag-types";

const dsc: ITag = {
  name: TAGS.DSC,
  description: "Differential scanning calorimetry",
  detail: "DSC",
  aliases: [],
};

const nmr: ITag = {
  name: TAGS.NMR,
  description: "Nuclear magnetic resonance spectroscopy",
  detail: "NMR",
  aliases: [],
};

const gc: ITag = {
  name: TAGS.GC,
  description: "gas chromatography",
  detail: "gc",
  aliases: [],
};

const ir: ITag = {
  name: TAGS.IR,
  description: "Infrared spectroscopy",
  detail: "ir",
  aliases: [],
};

const raman: ITag = {
  name: TAGS.RAMAN,
  description: "Raman spectroscopy",
  detail: "raman",
  aliases: [],
};

const uvVis: ITag = {
  name: TAGS.UV_VIS,
  description: "UV-Vis spectroscopy",
  detail: "uv_vis",
  aliases: [],
};

const gpc: ITag = {
  name: TAGS.GPC,
  description: "Gel permeation chromatography",
  detail: "gpc",
  aliases: ["SEC", "size-exclusion chromatography"],
};

const mcPlate: ITag = {
  name: TAGS.MCPLATE,
  description: "Microplate reader",
  detail: "microplate_reader",
  aliases: [],
};

const fluorescence: ITag = {
  name: TAGS.FLUOR,
  description: "Fluorescence spectroscopy",
  detail: "fluorescence",
  aliases: [],
};

const dls: ITag = {
  name: TAGS.DLS,
  description: "Dynamic light scattering",
  detail: "DLS",
  aliases: [],
};

const hplc: ITag = {
  name: TAGS.HPLC,
  description: "High pressure liquid chromatography",
  detail: "hplc",
  aliases: [],
};

const analyticalBalance: ITag = {
  name: TAGS.ANALYTICAL_BAL,
  description: "Analytical balance",
  detail: "analytical balance",
  aliases: [],
};

const maldi: ITag = {
  name: TAGS.MALDI,
  description: "Matrix assisted laser desorption ionization spectroscopy",
  detail: "MALDI",
  aliases: [],
};

export const characterizationTags = [
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
];
