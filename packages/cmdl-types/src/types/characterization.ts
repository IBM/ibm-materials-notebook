import { PROPERTIES } from "../properties";
import { ModelType } from "../groups/group-types";
import { BigQty, BigQtyUnitless, MeasuredProperty } from "./quantities";

export type CharReference = {
  name: string;
  path: string[];
  [PROPERTIES.CMC]?: BigQty;
  [PROPERTIES.LOADING_CAPACITY]: BigQty;
  [PROPERTIES.LAMBDA_MAX_ABS]?: BigQty;
  [PROPERTIES.LAMBDA_MAX_EMS]?: BigQty;
  [PROPERTIES.DH]?: BigQty;
  [PROPERTIES.DH_PDI]?: BigQtyUnitless;
  [PROPERTIES.ZETA_POTENTIAL]?: BigQty;
  [PROPERTIES.MIC]?: BigQty;
  [PROPERTIES.HC50]?: BigQty;
  [PROPERTIES.DISPERSITY]?: BigQtyUnitless;
  [PROPERTIES.MN_AVG]?: BigQty;
  [PROPERTIES.MW_AVG]?: BigQty;
  [PROPERTIES.CONVERSION]?: BigQty;
  [PROPERTIES.YIELD]?: BigQty;
  [PROPERTIES.DEGREE_POLY]?: BigQtyUnitless;
  [PROPERTIES.TEMP_CRYSTAL]?: BigQty;
  [PROPERTIES.TEMP_GLASS]?: BigQty;
  [PROPERTIES.TEMP_MELT]?: BigQty;
};

export type CharResult = CharReference & {
  [PROPERTIES.TIME_POINT]: BigQty | null;
  [PROPERTIES.SAMPLE_ID]: string;
  [PROPERTIES.TECHNIQUE]: string;
};

export type MeasuredData = {
  [PROPERTIES.CMC]: MeasuredProperty;
  [PROPERTIES.LOADING_CAPACITY]: MeasuredProperty;
  [PROPERTIES.LAMBDA_MAX_ABS]: MeasuredProperty;
  [PROPERTIES.LAMBDA_MAX_EMS]: MeasuredProperty;
  [PROPERTIES.DH]: MeasuredProperty;
  [PROPERTIES.DH_PDI]: MeasuredProperty;
  [PROPERTIES.ZETA_POTENTIAL]: MeasuredProperty;
  [PROPERTIES.MIC]: MeasuredProperty;
  [PROPERTIES.HC50]: MeasuredProperty;
  [PROPERTIES.DISPERSITY]: MeasuredProperty;
  [PROPERTIES.MN_AVG]: MeasuredProperty;
  [PROPERTIES.MW_AVG]: MeasuredProperty;
  [PROPERTIES.CONVERSION]: MeasuredProperty;
  [PROPERTIES.YIELD]: MeasuredProperty;
  [PROPERTIES.DEGREE_POLY]: MeasuredProperty;
  [PROPERTIES.TEMP_CRYSTAL]: MeasuredProperty;
  [PROPERTIES.TEMP_GLASS]: MeasuredProperty;
  [PROPERTIES.TEMP_MELT]: MeasuredProperty;
};

export type MeasuredDataArray = {
  [Property in keyof MeasuredData]: MeasuredData[Property][];
};

export type Result = Partial<MeasuredDataArray> & {
  name: string;
  [PROPERTIES.TIME_POINT]: BigQty | null;
  [PROPERTIES.SAMPLE_ID]: string;
};

export type CharDataOutput = {
  name: string;
  type: ModelType.CHAR_DATA;
  [PROPERTIES.TIME_POINT]: BigQty | null;
  [PROPERTIES.SAMPLE_ID]: string;
  [PROPERTIES.TECHNIQUE]: string;
  [PROPERTIES.FILE]: string | null;
};
