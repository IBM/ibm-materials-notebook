export interface ITag {
  description: string;
  detail: string;
  name: string;
  aliases: string[];
}

//TODO: remove underscore in tags
export enum TAGS {
  H = "1H",
  C = "13C",
  P = "31P",
  F = "19F",
  N = "15N",
  Si = "29SI",

  DSC = "dsc",
  NMR = "nmr",
  GC = "gc",
  IR = "ir",
  RAMAN = "raman",
  UV_VIS = "uv_vis",
  GPC = "gpc",
  MCPLATE = "microplate reader",
  FLUOR = "fluorescence",
  DLS = "dls",
  HPLC = "hplc",
  ANALYTICAL_BAL = "analytical balance",
  MALDI = "maldi",

  SOLID = "solid",
  LIQUID = "liquid",
  GAS = "gas",

  SMALL_MOLECULE = "small_molecule",
  MATERIAL = "material",
  REACTOR = "reactor",
  ORGANISM = "organism",

  /**
   * @deprecated
   **/
  NOTEBOOK = "notebook",
  /**
   * @deprecated
   **/
  JOURNAL = "journal",

  ATMOSPHERE = "atmosphere",
  CATALYST = "catalyst",
  INITIATOR = "initiator",
  MONOMER = "monomer",
  PRODUCT = "product",
  REACTANT = "reactant",
  REAGENT = "reagent",
  SOLVENT = "solvent",

  HOMOPOLYMER = "homopolymer",
  BLOCK_COPOLYMER = "block_copolymer",
  STAT_COPOLYMER = "statistical_copolymer",
  GRAFT = "graft",
  BRUSH = "brush",
  LINEAR = "linear",
  CYCLIC = "cyclic",
  CROSS_LINKED = "cross-linked",
  STAR = "star",
  COMPLEX = "complex",

  MIXED_MICELLES = "mixed_micelles",

  POLYBUTADIENE = "polybutadiene",
  POLYSILOXANE = "polysiloxane",
  POLYCARBOSILANE = "polycarbosilane",
  POLYNORBORNENE = "polynorbornene",
  POLYPHOSPHONATE = "polyphosphonate",
  POLYCARBONATE = "polycarbonate",
  POLYACRYLATE = "polyacrylate",
  POLYSTYRENE = "polystyrene",
  POLYETHYLENEGLYCOL = "poly(ethylene glycol)",
  POLYESTER = "polyester",
  POLYLACTIDE = "polylactide",
  POLYVINYLPYRIDINE = "poly(vinylpyridine)",

  /**
   * @deprecated
   **/
  POLYMERIZATION = "polymerization",
  BULK_POLYMERIZATION = "bulk polymerization",
  ROP = "ring-opening polymerization",
  ZROP = "zwitterionic ring-opening polymerization",
  ROMP = "ROMP",
  POST_POLY_FUNC = "post-polymerization modification",
  CHAIN_EXTENSION = "chain extension",
  COMPLEXATION = "complexation",
}
