import { PROPERTIES } from "../properties";
import { ModelType } from "../groups/group-types";
import { ChemicalReference } from "./chemicals";
import { BigQty } from "./quantities";

export type CharData = {
  name: string;
  type: string;
  references?: ChemicalReference[];
  [key: string]: ChemicalReference[] | string | BigQty | undefined;
};

export type SampleResult = {
  name: string;
  type: ModelType;
  [PROPERTIES.TIME_POINT]: BigQty | null;
  sampleId: string;
  [key: string]:
    | BigQty
    | string
    | ModelType
    | null
    | any[]
    | Record<string, any>;
};

export type SampleOutput = {
  name: string;
  type: ModelType.SAMPLE;
  results: SampleResult[];
  charData: CharOutput[];
};

export type RefResult = {
  technique: string;
  source: string;
  property: string;
  value: any;
  name: string;
  path: string[];
};

export type CharOutput = {
  name: string;
  technique: string;
  sampleId: string;
  references: string[];
  [key: string]: string | string[] | undefined | ChemicalReference[] | BigQty;
};
