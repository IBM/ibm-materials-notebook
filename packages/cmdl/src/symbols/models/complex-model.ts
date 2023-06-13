import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, PROPERTIES } from "cmdl-types";
import { CMDLChemical, CMDLPolymer } from "./base-model";

type ComplexRef = {
  name: string;
  path: string[];
  [PROPERTIES.RATIO]: number;
};

export type ComplexPolymer = CMDLPolymer & {
  [PROPERTIES.RATIO]: number;
};

export type ComplexChemical = CMDLChemical & {
  [PROPERTIES.RATIO]: number;
};

export type CMDLComplex = {
  name: string;
  type: ModelType.COMPLEX;
  components: (ComplexChemical | ComplexPolymer)[];
};

export class Complex extends BaseModel {
  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.COMPLEX
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    const properties: Record<string, any> = {
      name: this.name,
      type: this.type,
    };
    for (const [name, value] of this.modelAR.all()) {
      if (name === PROPERTIES.COMPONENTS) {
        let updatedComponents = (value as ComplexRef[]).map(
          (item: ComplexRef) => {
            let compRef = globalAR.getValue<CMDLChemical | CMDLPolymer>(
              item.name
            );
            return {
              ...compRef,
              ratio: item.ratio,
            };
          }
        );
        properties[name] = updatedComponents;
      } else {
        properties[name] = value;
      }
    }

    globalAR.setValue(this.name, properties);
  }
}
