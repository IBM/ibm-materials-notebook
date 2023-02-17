import BaseUnit from "./BaseUnit";
import Big from "big.js";
import { UnitPrefixes } from "./unitConversions";
import { Quantity } from "../symbol-types";

export default class Unit {
  unit: string;
  _value: Big;
  subUnits: BaseUnit[];
  numerator: BaseUnit[];
  denominator: BaseUnit[];

  constructor({ unit, value }: Quantity) {
    this._value = new Big(value);
    this.unit = unit;
    this.subUnits = [];
    this.numerator = [];
    this.denominator = [];
    this.parseUnit(unit);
  }

  get value() {
    return this._value;
  }

  get exponent() {
    return this._value.e;
  }

  set value(value) {
    this._value = new Big(value);
  }

  /**
   * Parses unit string into component base units
   */
  parseUnit(unit: string) {
    let componentUnits = unit.split("*");
    this.subUnits = componentUnits.map((item) => new BaseUnit(item));
    this.numerator = this.subUnits.filter((unit) => unit.exponent > 0);
    this.denominator = this.subUnits.filter((unit) => unit.exponent < 0);
  }

  /**
   * converts unit to a new unit
   */
  convertTo(newUnit: string) {
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
   */
  //TODO: Handle that some units (eg. time) do not have use certain prefixes
  scaleTo(newPrefix: UnitPrefixes) {
    let newConversionFactors = this.subUnits.map((item) => {
      let newFactor = item.scaleTo(newPrefix);
      return newFactor;
    });
    this.updateUnitValues(newConversionFactors);
  }

  /**
   * scales unit to new exponent
   * TODO: add type predicate for isValid
   */
  scaleToNext(direction: number) {
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
  invert() {
    this.subUnits.forEach((item) => item.invertBaseUnit());
    this.numerator = this.subUnits.filter((sub) => sub.exponent > 0);
    this.denominator = this.subUnits.filter((sub) => sub.exponent < 0);
    this._value = this._value.pow(-1);
    this.unit = this.compileUnitString();
  }

  /**
   * Function to convert subunits to new base (e.g. min to s, MPa to bar, etc.)
   * Not for compound units
   */
  changeUnitBase(newUnit: string) {
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
  convertToBaseType() {
    let newConversionFactors = this.subUnits.map((item) => {
      let newFactor = item.convertToBaseType();
      return newFactor;
    });
    this.updateUnitValues(newConversionFactors);
  }

  updateUnitValues(factorArr: number[]) {
    factorArr.forEach((factor) => {
      this._value = this._value.times(factor);
    });
    this.numerator = this.subUnits.filter((sub) => sub.exponent > 0);
    this.denominator = this.subUnits.filter((sub) => sub.exponent < 0);
    this.unit = this.compileUnitString();
  }

  /**
   * compliles a unit string from the current array of subunits
   */
  compileUnitString() {
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
  getPrefix() {
    if (this.subUnits.length === 1) {
      return this.subUnits[0].prefix;
    } else {
      console.warn("Cannot get prefix of compound unit");
    }
  }

  /**
   * Provides object output of the unit and value
   */
  output() {
    let { unit, value } = this;
    return { unit, value };
  }
}
