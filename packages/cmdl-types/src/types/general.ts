import { PROPERTIES } from "../properties";
import { TAGS } from "../tags";

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
  [PROPERTIES.TAGS]?: TAGS[];
  // [PROPERTIES.RECORD_ID]?: string;
  [PROPERTIES.EXP_ID]?: string;
  notebookId?: string; //assigned by extension automatically
}
