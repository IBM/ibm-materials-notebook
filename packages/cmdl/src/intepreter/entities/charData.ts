import { Entity, EntityConfigValues, Exportable, Renderable } from "./entity";
import { PolymerEntity } from "./polymer";
import { ChemicalEntity } from "./chemicals";
import { TYPES, TAGS, PROPERTIES, ModelType } from "../../cmdl-types";
import Big from "big.js";
import { convertQty } from "../../cmdl-units";
import { Export } from "../../cmdl-types/types";

export class ResultEntity
  extends Entity<TYPES.Result>
  implements Exportable, Renderable
{
  private chemicalEntity: PolymerEntity | ChemicalEntity;

  constructor(
    name: string,
    type: string,
    entity: PolymerEntity | ChemicalEntity
  ) {
    super(name, type);
    this.chemicalEntity = entity;
  }

  get resultName() {
    return `${this.name}-${this.properties.sample_id}`;
  }

  public clone() {
    const clone = Object.create(this);
    clone.chemicalEntity = this.chemicalEntity.clone();
    return clone;
  }

  public addMeasuredProperty(
    key: keyof TYPES.MeasuredData,
    value: TYPES.MeasuredData[keyof TYPES.MeasuredData]
  ) {
    const currentValues = this.properties[key];
    if (currentValues) {
      this.properties[key] = [...currentValues, value];
    } else {
      this.properties[key] = [value];
    }
  }

  public getConfigValues(): EntityConfigValues {
    if (this.chemicalEntity instanceof ChemicalEntity) {
      return this.chemicalEntity.getConfigValues();
    }

    const polymerValues = this.chemicalEntity.getConfigValues();
    const measuredMn = this.selectPolymerMn();

    return { ...polymerValues, mw: measuredMn };
  }

  private selectPolymerMn(): Big {
    if (!this.properties.mn_avg) {
      throw new Error(`No Mn defined for ${this.resultName}!`);
    }

    if (this.properties.mn_avg.length === 1) {
      return this.properties.mn_avg[0].value;
    }

    const nmrMn = this.properties.mn_avg.filter(
      (el) => el.technique === TAGS.NMR
    );
    const gpcMn = this.properties.mn_avg.filter(
      (el) => el.technique === TAGS.GPC
    );

    if (nmrMn.length) {
      return nmrMn[0].value;
    } else if (gpcMn.length) {
      return gpcMn[0].value;
    } else {
      throw new Error(`unable to find valid Mn for ${this.resultName}`);
    }
  }

  public export(): TYPES.ResultExport {
    if (
      this.chemicalEntity instanceof PolymerEntity &&
      this.properties.degree_poly
    ) {
      const values = this.properties.degree_poly.map((el) => ({
        name: this.name,
        path: el?.path || [],
        [PROPERTIES.DEGREE_POLY]: {
          unit: null,
          value: String(el.value),
          uncertainty: el.uncertainty ? String(el.uncertainty) : null,
        },
      }));
      this.chemicalEntity.embedNodeValues(values);
    }

    const resultEntity = this.chemicalEntity.export();
    const props = Object.entries(this.properties).reduce(
      (prev, [key, value]) => {
        if (!value || typeof value === "string") {
          return { ...prev, [key]: value };
        }

        if (Array.isArray(value)) {
          const updatedMeasurements: TYPES.NumericProperty[] = [];
          for (const item of value) {
            const newItem = {
              ...item,
              value: item.value.toNumber(),
              uncertainty: item.uncertainty
                ? item.uncertainty.toNumber()
                : null,
            };
            updatedMeasurements.push(newItem);
          }
          return { ...prev, [key]: updatedMeasurements };
        }

        const newValue = {
          ...value,
          value: value.value.toNumber(),
          uncertainty: value.uncertainty ? value.uncertainty.toNumber() : null,
        };
        return { ...prev, [key]: newValue };
      },
      {} as Export<TYPES.Result>
    );

    return {
      ...props,
      name: this.name,
      entity: resultEntity,
    };
  }

  public render(): TYPES.ResultRender {
    return {
      ...this.export(),
      type: "result",
    };
  }
}

export class CharDataEntity
  extends Entity<TYPES.CharData>
  implements Exportable, Renderable
{
  public export(): TYPES.CharDataExport {
    return {
      ...this.properties,
      name: this.name,
      time_point: this.properties.time_point
        ? convertQty(this.properties.time_point)
        : null,
    };
  }

  public render(): TYPES.CharDataRender {
    return {
      ...this.export(),
      type: ModelType.CHAR_DATA,
    };
  }
}
