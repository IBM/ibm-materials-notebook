import { TAGS } from "../tags";

export enum PropertyTypes {
  CATEGORICAL_SINGLE = "categorical_single",
  CATEGORICAL_MULTI = "categorical_multi",
  LIST = "list",
  NUMERICAL = "numerical",
  NUMERICAL_UNIT = "numerical_unit",
  TEXT = "text",
  REF_SINGLE = "ref_single",
  REF_MULTI = "ref_multi",
  BOOLEAN = "boolean",
  ASSIGNMENT = "assignment",
}

//TODO: improve specific typing of different properties
export interface IProperty {
  description: string;
  detail: string;
  type: PropertyTypes;
  baseUnit?: string;
  name: string;
  aliases: string[];
  units?: string[];
  min?: number;
  max?: number;
  categorical_values?: TAGS[];
}

export enum PROPERTIES {
  //biological
  MIC = "mic",
  TREATMENT_CONC = "treatment_conc",
  HC50 = "hc50",
  CELL_VIABILITY = "cell_viability",
  ZETA_POTENTIAL = "zeta_potential",
  CMC = "cmc",
  DH = "Dh",
  DH_PDI = "Dh_pdi",
  LOADING_CAPACITY = "loading_capacity",

  //categorical
  NMR_NUCLEI = "nmr_nuclei",
  ROLES = "roles",
  TAGS = "tags",

  //equipment
  LENGTH = "length",
  OUTER_DIAMETER = "outer_diameter",
  INNER_DIAMETER = "inner_diameter",

  //spectral
  WAVELENGTH = "wavelength",
  WAVENUMBER = "wavenumber",
  LAMBDA_MAX_EMS = "lambda_max_ems",
  LAMBDA_MAX_ABS = "lambda_max_abs",

  //polymer
  DEGREE_POLY = "degree_poly",
  MN_AVG = "mn_avg",
  MW_AVG = "mw_avg",
  DISPERSITY = "dispersity",

  //reaction
  MASS = "mass",
  VOLUME = "volume",
  MOLES = "moles",
  PRESSURE = "pressure",
  CONVERSION = "conversion",
  YIELD = "yield",
  REACTION_TIME = "reaction_time",
  RUN_TIME = "run_time",
  COLLECTION_TIME = "collection_time",
  TIME_POINT = "time_point",
  FLOW_RATE = "flow_rate",
  MIX_RATE = "mixing_rate",
  PH = "pH",
  POTENTIAL = "potential",
  PRESSURE_RATE = "pressure_rate",
  QUANTITY = "quantity",
  RATIO = "ratio",
  LIMITING = "limiting",

  //physical
  MOL_WEIGHT = "molecular_weight",
  DENSITY = "density",
  STATE = "state",

  //text
  ALIASES = "aliases",
  NAME = "name",
  TITLE = "title",
  DOI = "doi",
  CITATION = "citation",
  DATE = "date",
  EXP_ID = "exp_id",
  // RECORD_ID = "record_id",
  SAMPLE_ID = "sample_id",
  SMILES = "smiles",
  BIG_SMILES = "big_smiles",
  STRUCTURE = "structure",
  INCHI = "inchi",
  INCHI_KEY = "inchi_key",
  DESCRIPTION = "description",
  PROTOCOL = "protocol",

  //thermal
  TEMPERATURE = "temperature",
  TEMP_MELT = "temp_melt",
  TEMP_GLASS = "temp_glass",
  TEMP_CRYSTAL = "temp_crystal",
  TEMP_BOILING = "temp_boiling",
  TEMP_DEGRADE = "temp_degrade",
  TEMP_ONSET = "temp_onset",
  TEMP_SUBLIME = "temp_sublime",
  TECHNIQUE = "technique",

  //light
  LIGHT_IRR = "light_irradiance",
  LIGHT_PWR = "light_power",
  LIGHT_PWR_ELEC = "light_power_electricity",

  //reference
  TARGETS = "targets",
  TARGET = "target",
  FRAGMENT = "fragment",
  SOURCES = "sources",
  COMPONENT = "component",
  COMPONENTS = "components",
  NODES = "nodes",
  CONNECTIONS = "connections",
  FILE = "file",
  REACTOR = "reactor",
  INPUT = "input",
  REF_ID = "ref_id",
  SOURCE_TYPE = "type",
}
