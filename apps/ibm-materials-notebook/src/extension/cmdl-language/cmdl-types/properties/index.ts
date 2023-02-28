import { biologicalProperties } from "./biological-properties";
import { equipmentProperties } from "./equipment-properties";
import { physicalProperties } from "./physical-properties";
import { polymerProperties } from "./polymer-properties";
import { reactionProperties } from "./reaction-properties";
import { spectralProperties } from "./spectral-properties";
import { thermalProperties } from "./thermal-properties";
import { categoricalProperties } from "./categorical-properties";
import { textProperties } from "./text-properties";
import { referenceProperties } from "./reference-properties";
import { IProperty, PROPERTIES, PropertyTypes } from "./property-types";

const allProperties = [
  ...biologicalProperties,
  ...equipmentProperties,
  ...physicalProperties,
  ...polymerProperties,
  ...reactionProperties,
  ...spectralProperties,
  ...thermalProperties,
  ...categoricalProperties,
  ...textProperties,
  ...referenceProperties,
];

export { IProperty, PROPERTIES, allProperties, PropertyTypes };
