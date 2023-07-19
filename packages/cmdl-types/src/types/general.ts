import { PROPERTIES } from "../properties";
import { GROUPS } from "../groups";
import { TAGS } from "../tags";
import { Polymer, PolymerGraph } from "./polymer";
import { Chemical, Fragment } from "./chemicals";
import { Reactor } from "./reactors";

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
