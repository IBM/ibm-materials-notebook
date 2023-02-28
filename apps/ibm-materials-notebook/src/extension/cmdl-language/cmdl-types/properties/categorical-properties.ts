import { IProperty, PropertyTypes, PROPERTIES } from "./property-types";
import { TAGS } from "../tags";

const nmrNuclei: IProperty = {
  description: "nuclei for NMR characterization",
  type: PropertyTypes.CATEGORICAL_SINGLE,
  detail: "NMR nuclei",
  name: PROPERTIES.NMR_NUCLEI,
  aliases: ["nmr nuclei"],
  categorical_values: [TAGS.H, TAGS.C, TAGS.F, TAGS.P, TAGS.N, TAGS.Si],
};

const sourceType: IProperty = {
  description: "reference source type for experiments",
  type: PropertyTypes.CATEGORICAL_SINGLE,
  detail: "source type",
  name: PROPERTIES.SOURCE_TYPE,
  aliases: [],
  categorical_values: [TAGS.JOURNAL, TAGS.NOTEBOOK],
};

const reactionRoles: IProperty = {
  description: "Reaction roles for chemical or material",
  detail: "Reaction roles",
  type: PropertyTypes.CATEGORICAL_MULTI,
  name: PROPERTIES.ROLES,
  aliases: [],
  categorical_values: [
    TAGS.ATMOSPHERE,
    TAGS.INITIATOR,
    TAGS.CATALYST,
    TAGS.MONOMER,
    TAGS.REACTANT,
    TAGS.REAGENT,
    TAGS.SOLVENT,
    TAGS.PRODUCT,
  ],
};

const physicalState: IProperty = {
  description: "Physical state of chemical or material",
  detail: "Physical state",
  name: PROPERTIES.STATE,
  type: PropertyTypes.CATEGORICAL_SINGLE,
  aliases: [],
  categorical_values: [TAGS.SOLID, TAGS.LIQUID, TAGS.GAS],
};

const measurementTech: IProperty = {
  description:
    "Technique used to measure physical properties or characteristics",
  detail: "Measurement techniques",
  name: PROPERTIES.TECHNIQUE,
  type: PropertyTypes.CATEGORICAL_SINGLE,
  aliases: [],
  categorical_values: [
    TAGS.DLS,
    TAGS.DSC,
    TAGS.ANALYTICAL_BAL,
    TAGS.NMR,
    TAGS.FLUOR,
    TAGS.UV_VIS,
    TAGS.GC,
    TAGS.IR,
    TAGS.RAMAN,
    TAGS.GPC,
    TAGS.HPLC,
    TAGS.MCPLATE,
    TAGS.MALDI,
  ],
};

const templateType: IProperty = {
  description: "Type of reference within a record",
  detail: "Reference type",
  type: PropertyTypes.CATEGORICAL_SINGLE,
  name: PROPERTIES.TEMPLATE,
  aliases: [],
  categorical_values: [
    TAGS.SMALL_MOLECULE,
    TAGS.MATERIAL,
    TAGS.REACTOR,
    TAGS.POLYMER_GRAPH,
    TAGS.FLOW_EXPERIMENT,
    TAGS.BATCH_EXPERIMENT,
  ],
};

const tags: IProperty = {
  description: "Type of reference within a record",
  detail: "Reference type",
  type: PropertyTypes.CATEGORICAL_MULTI,
  name: PROPERTIES.TAGS,
  aliases: [],
  categorical_values: [
    TAGS.POLYMERIZATION,
    TAGS.HOMOPOLYMER,
    TAGS.BLOCK_COPOLYMER,
    TAGS.STAT_COPOLYMER,
    TAGS.GRAFT,
    TAGS.BRUSH,
    TAGS.LINEAR,
    TAGS.CYCLIC,
    TAGS.CROSS_LINKED,
    TAGS.STAR,
    TAGS.COMPLEX,
    TAGS.MIXED_MICELLES,
    TAGS.POLYBUTADIENE,
    TAGS.POLYSILOXANE,
    TAGS.POLYCARBOSILANE,
    TAGS.POLYNORBORNENE,
    TAGS.POLYPHOSPHONATE,
    TAGS.POLYCARBONATE,
    TAGS.POLYACRYLATE,
    TAGS.POLYSTYRENE,
    TAGS.POLYETHYLENEGLYCOL,
    TAGS.POLYESTER,
    TAGS.POLYLACTIDE,
    TAGS.POLYVINYLPYRIDINE,
    TAGS.BULK_POLYMERIZATION,
    TAGS.ROP,
    TAGS.ZROP,
    TAGS.ROMP,
    TAGS.POST_POLY_FUNC,
    TAGS.CHAIN_EXTENSION,
    TAGS.COMPLEXATION,
    TAGS.MIXED_MICELLES,
  ],
};

export const categoricalProperties = [
  nmrNuclei,
  reactionRoles,
  physicalState,
  measurementTech,
  templateType,
  sourceType,
  tags,
];
