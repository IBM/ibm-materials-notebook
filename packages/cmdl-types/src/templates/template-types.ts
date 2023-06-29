export interface ITemplates {
  description: string;
  detail: string;
  name: string;
  groups: string[];
}

//! deprecated
export enum TEMPLATES {
  REFERENCE = "reference",
  BATCH_EXPERIMENT = "batch_experiment",
  FLOW_EXPERIMENT = "flow_experiment",
  ASSAY = "assay",
  FORMULATION = "formulation",

  SMALL_MOLECULE = "small_molecule",
  MATERIAL = "material",

  REACTOR = "reactor_graph",

  POLYMER_GRAPH = "polymer_graph",
  FRAGMENT = "fragment",
}
