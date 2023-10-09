import BaseUnit from "./base-unit";
import Big from "big.js";
import { UnitPrefixes } from "./unit-conversions";
import { TYPES } from "@ibm-materials/cmdl-types";

/**
 * Top-level class for managing and converting units
 */
export default class Unit {
  unit: string;
  _value: Big;
  subUnits: BaseUnit[];
  numerator: BaseUnit[];
  denominator: BaseUnit[];

  constructor({ unit, value }: TYPES.Qty) {
    if (!unit) {
      throw new Error("Invalid unit, no unit defined");
    }

    this._value = Big(value);
    this.unit = unit;
    this.subUnits = [];
    this.numerator = [];
    this.denominator = [];
    this.parseUnit(unit);
  }

  /**
   * Retrieves unit value
   */
  get value(): Big {
    return this._value;
  }

  /**
   * Retrieves unit exponent
   */
  get exponent(): number {
    return this._value.e;
  }

  /**
   * Sets unit value
   */
  set value(value) {
    this._value = new Big(value);
  }

  /**
   * Parses unit string into component base units
   * @param unit string
   */
  public parseUnit(unit: string): void {
    let componentUnits = unit.split("*");
    this.subUnits = componentUnits.map((item) => new BaseUnit(item));
    this.numerator = this.subUnits.filter((unit) => unit.exponent > 0);
    this.denominator = this.subUnits.filter((unit) => unit.exponent < 0);
  }

  /**
   * Converts unit to a new unit
   * @param newUnit string
   */
  public convertTo(newUnit: string): void {
    if (newUnit === this.unit) {
      return;
    }
    let componentUnits = newUnit.split("*");
    const newSubUnits = componentUnits.map((item) => new BaseUnit(item));

    if (newSubUnits.length === this.subUnits.length) {
      let newConversionFactors = this.subUnits.map((sub, index) => {
        let base = newSubUnits[index].base;
        let prefix = newSubUnits[index].prefix;
        let exp = newSubUnits[index].exponent;

        if (base !== sub.base) {
          throw new Error("Invalid unit base conversion");
        }

        if (sub.exponent !== exp) {
          throw new Error("Invalid unit exponent conversion");
        }

        return sub.scaleTo(prefix);
      });
      this.updateUnitValues(newConversionFactors);
    } else {
      throw new Error(`Invalid unit conversion`);
    }
  }

  /**
   * Scales unit to new prefix value, scales each subunit with new prefix
   * @param newPrefix UnitPrefixes
   * @todo Handle that some units (eg. time) do not have use certain prefixes
   */
  public scaleTo(newPrefix: UnitPrefixes): void {
    let newConversionFactors = this.subUnits.map((item) => {
      let newFactor = item.scaleTo(newPrefix);
      return newFactor;
    });
    this.updateUnitValues(newConversionFactors);
  }

  /**
   * scales unit to new exponent
   * @param direction number
   * @TODO add type predicate for isValid
   */
  public scaleToNext(direction: number): void {
    let newConversionFactors = this.subUnits.map((item) => {
      let newFactor = item.scaleToNext(direction);
      return newFactor;
    });

    let isValid = newConversionFactors.every((el) => el);

    if (isValid) {
      this.updateUnitValues(newConversionFactors as number[]);
    }
  }

  /**
   * Inverts unit and adjusts value and unit exponents
   */
  public invert(): void {
    this.subUnits.forEach((item) => item.invertBaseUnit());
    this.numerator = this.subUnits.filter((sub) => sub.exponent > 0);
    this.denominator = this.subUnits.filter((sub) => sub.exponent < 0);
    this._value = this._value.pow(-1);
    this.unit = this.compileUnitString();
  }

  /**
   * Function to convert subunits to new base (e.g. min to s, MPa to bar, etc.)
   * Not for compound units
   * @param newUnit string
   */
  public changeUnitBase(newUnit: string): void {
    if (this.subUnits.length > 1) {
      const errMsg = `invalid base conversion on compound unit: ${this.unit} to ${newUnit}`;
      throw new Error(errMsg);
    } else {
      const newConversionFactors = this.subUnits[0].convertToNewBase(newUnit);
      this.updateUnitValues([newConversionFactors]);
    }
  }

  /**
   * converts unit to the base type for that unit (e.g mg --> g, mcmol --> mol)
   */
  public convertToBaseType(): void {
    let newConversionFactors = this.subUnits.map((item) => {
      let newFactor = item.convertToBaseType();
      return newFactor;
    });
    this.updateUnitValues(newConversionFactors);
  }

  /**
   * Updates unit values based on a scaling factor
   * @param factorArr number[]
   */
  public updateUnitValues(factorArr: number[]): void {
    factorArr.forEach((factor) => {
      this._value = this._value.times(factor);
    });
    this.numerator = this.subUnits.filter((sub) => sub.exponent > 0);
    this.denominator = this.subUnits.filter((sub) => sub.exponent < 0);
    this.unit = this.compileUnitString();
  }

  /**
   * Compliles a unit string from the current array of subunits
   * @returns string
   */
  public compileUnitString(): string {
    if (this.subUnits.length === 1) {
      return this.subUnits[0].unit;
    }
    let finalUnit = this.subUnits
      .sort((a, b) => b.exponent - a.exponent)
      .reduce((acc, curr) => {
        let currString = acc.length ? `${acc}*` : "";
        return `${currString}${curr.unit}`;
      }, "");

    return finalUnit;
  }

  /**
   * retrieves the prefix for non-compound units
   */
  public getPrefix(): UnitPrefixes | undefined {
    if (this.subUnits.length === 1) {
      return this.subUnits[0].prefix;
    } else {
      console.warn("Cannot get prefix of compound unit");
    }
  }

  /**
   * Provides object output of the unit and value
   * @returns Object<{ unit: string; value: Big }>
   */
  public output(): { unit: string; value: Big } {
    let { unit, value } = this;
    return { unit, value };
  }
}
