import { PROPERTIES } from "../properties";
import { GROUPS } from "../groups";
import { TAGS } from "../tags";
// import { Chemical, Fragment, Complex } from "./chemicals";
// import { Polymer, PolymerGraph } from "./polymer";
// import { FlowReactor } from "./reactors";
// import { FlowRxn, Reaction, Solution } from "./reactions";
// import { SampleOutput } from "./characterization";

export interface RecordSource {
  [PROPERTIES.TITLE]?: string;
  [PROPERTIES.DATE]?: string;
  [PROPERTIES.SOURCE_TYPE]?: string;
  [PROPERTIES.DOI]?: string;
  [PROPERTIES.CITATION]?: string;
}

export interface MetaData {
  [PROPERTIES.TITLE]?: string;
  [PROPERTIES.NAME]?: string;
  [PROPERTIES.DATE]?: string;
  [PROPERTIES.OWNER]?: string;
  [PROPERTIES.TEMPLATE]: string;
  [PROPERTIES.TAGS]?: TAGS[];
  [PROPERTIES.RECORD_ID]?: string;
  [PROPERTIES.EXP_ID]?: string;
  [GROUPS.SOURCE]?: RecordSource;
  notebookId?: string; //assigned by extension automatically
}
