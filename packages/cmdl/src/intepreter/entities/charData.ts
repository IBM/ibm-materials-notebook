import { Entity, CMDLChemEntity, EntityConfigValues } from "./entity";
import { PolymerEntity } from "./polymer";
import { ChemicalEntity } from "./chemicals";
import { TYPES, TAGS, PROPERTIES } from "@ibm-materials/cmdl-types";
import Big from "big.js";
import { CharFileReader } from "./files";

export class ResultEntity
  extends Entity<TYPES.Result>
  implements CMDLChemEntity
{
  private chemicalEntity: PolymerEntity | ChemicalEntity;
  private files: CharFileReader[] = [];

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

  public addFile(file: CharFileReader): void {
    this.files.push(file);
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

  public protocolExport() {
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
    return {
      name: this.name,
      charData: this.files.length ? this.files[0].export() : null,
      structure:
        this.chemicalEntity instanceof PolymerEntity
          ? this.chemicalEntity.getGraphString()
          : this.chemicalEntity.getSMILES(),
    };
  }
}

export class CharDataModel extends Entity<TYPES.CharDataOutput> {}
