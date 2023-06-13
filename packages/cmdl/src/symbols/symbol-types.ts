import Big from "big.js";
import { GROUPS, PROPERTIES, TAGS } from "cmdl-types";
import { CMDLChemical, CMDLFragment, CMDLPolymer } from "./models/base-model";
import { CMDLComplex } from "./models/complex-model";
import { CMDLFlowRxn } from "./models/flow-model";
import { CMDLPolymerGraph } from "./models/polymer-graph-model";
import { CMDLReaction } from "./models/reaction-model";
import { CMDLFlowReactor } from "./models/reactor-model";
import { CMDLSampleOutput } from "./models/sample-model";
import { CMDLSolution } from "./models/solution-model";

export interface CMDLRef {
  ref: string;
  path: string[];
}

interface BaseUnit {
  value: string;
  unit: string | null;
  uncertainty: string | null;
}

export interface CMDLRecordSource {
  [PROPERTIES.TITLE]?: string;
  [PROPERTIES.DATE]?: string;
  [PROPERTIES.SOURCE_TYPE]?: string;
  [PROPERTIES.DOI]?: string;
  [PROPERTIES.CITATION]?: string;
}

export interface CMDLMetaData {
  [PROPERTIES.TITLE]?: string;
  [PROPERTIES.NAME]?: string;
  [PROPERTIES.DATE]?: string;
  [PROPERTIES.OWNER]?: string;
  [PROPERTIES.TEMPLATE]: string;
  [PROPERTIES.TAGS]?: TAGS[];
  [PROPERTIES.RECORD_ID]?: string;
  [PROPERTIES.EXP_ID]?: string;
  [GROUPS.SOURCE]?: CMDLRecordSource;
  notebookId?: string; //assigned by extension automatically
}

export interface CMDLUnit extends BaseUnit {
  unit: string;
}

export interface CMDLUnitless extends BaseUnit {
  unit: null;
}

export interface NumberQuantity {
  unit: string;
  value: number;
  uncertainty: number | null;
}

export interface Quantity {
  value: Big;
  uncertainty: Big | null;
  unit: string;
}

export type CMDLNodeTree = {
  [i: string]: CMDLNodeTree;
};

export type CMDLRecordRefs =
  | CMDLChemical
  | CMDLFragment
  | CMDLPolymer
  | CMDLComplex
  | CMDLFlowReactor
  | CMDLFlowRxn
  | CMDLReaction
  | CMDLSampleOutput
  | CMDLPolymerGraph
  | CMDLSolution
  | CMDLFlowReactor;

export type CMDLRecordTypes = CMDLMetaData | CMDLRecordRefs;
