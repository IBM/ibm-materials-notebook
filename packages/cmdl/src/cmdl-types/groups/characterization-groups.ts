import { IGroup, GROUPS, ModelType } from "./group-types";
import { PROPERTIES } from "../properties";

const characteriztionGroup: IGroup = {
  name: GROUPS.CHAR_DATA,
  modelType: ModelType.CHAR_DATA,
  description: "Characterization data for experiment, reaction, or compound",
  detail: "Characterization data",
  aliases: [],
  subGroups: [],
  referenceProps: [
    PROPERTIES.LOADING_CAPACITY,
    PROPERTIES.CMC,
    PROPERTIES.LAMBDA_MAX_ABS,
    PROPERTIES.LAMBDA_MAX_EMS,
    PROPERTIES.DH,
    PROPERTIES.DH_PDI,
    PROPERTIES.ZETA_POTENTIAL,
    PROPERTIES.MIC,
    PROPERTIES.HC50,
    PROPERTIES.DISPERSITY,
    PROPERTIES.MN_AVG,
    PROPERTIES.MW_AVG,
    PROPERTIES.CONVERSION,
    PROPERTIES.YIELD,
    PROPERTIES.DEGREE_POLY,
    PROPERTIES.TEMP_CRYSTAL,
    PROPERTIES.TEMP_GLASS,
    PROPERTIES.TEMP_MELT,
  ],
  properties: [
    PROPERTIES.DATE,
    PROPERTIES.SAMPLE_ID,
    PROPERTIES.TIME_POINT,
    PROPERTIES.FILE,
    PROPERTIES.SOURCE,
    PROPERTIES.TECHNIQUE,
  ],
};

export const characterizationGroups = [characteriztionGroup];
