import { units, prefixes, UnitBases, UnitPrefixes } from './unitConversions';
import { parseUnit } from './unitRegex';
import Big from 'big.js';

//TODO: switch to geting unit conversion info from typemanger
/**
 * Base unit for each subunit of Unit, handles changing conversion factors
 *
 */
export default class BaseUnit {
  unit: string;
  prefix: UnitPrefixes;
  base: UnitBases;
  exponent: number;
  type: (string | number)[];
  _prefix_factor: Big;
  _conversion_factor: Big;

  constructor(unit: string) {
    let { prefix, base, exponent, type } = parseUnit(unit);
    this.unit = unit;
    this.prefix = prefix;
    this.base = base;
    this.exponent = exponent;
    this.type = type;
    this._prefix_factor = new Big(prefixes[prefix]);
    this._conversion_factor = new Big(
      Math.pow(this.prefix_factor, this.exponent)
    );
  }

  get prefix_factor() {
    return this._prefix_factor.toNumber();
  }

  set prefix_factor(number) {
    this._prefix_factor = new Big(number);
  }

  get conversion_factor() {
    return this._conversion_factor;
  }

  set conversion_factor(number: Big) {
    this._conversion_factor = number;
  }

  /**
   * Scales base unit to new prefix
   */
  scaleTo(newPrefix: UnitPrefixes) {
    if (newPrefix === this.prefix) {
      return 1;
    }

    let ratio = this.computeFactorRatio({ prefix: newPrefix, base: this.base });
    let newUnit = this.buildUnitString(newPrefix, this.base, this.exponent);
    let conversionFactor = ratio.pow(this.exponent);

    this.unit = newUnit;
    this.prefix = newPrefix;
    this.prefix_factor = prefixes[newPrefix];
    this.conversion_factor = conversionFactor;

    return conversionFactor.toNumber();
  }

  private computeFactorRatio(newGroups: {
    prefix: UnitPrefixes;
    base: UnitBases;
  }) {
    if (this.base !== newGroups.base) {
      throw new Error('Cannot change unit base!');
    }

    return this._prefix_factor.div(prefixes[newGroups.prefix]);
  }

  /**
   * scales unit to next exponent value
   */
  scaleToNext(direction: number) {
    let prefixArr = Object.keys(prefixes);
    let currIndex = prefixArr.indexOf(this.prefix);

    if (
      (this.prefix === 'k' && direction < 0) ||
      (this.prefix === 'm' && direction > 0)
    ) {
      return this.scaleTo('base');
    } else if (this.prefix === 'base') {
      let newPrefix = direction > 0 ? 'k' : 'm';
      return this.scaleTo(newPrefix as UnitPrefixes);
    } else {
      if (
        (currIndex === 0 && direction < 0) ||
        (currIndex === prefixArr.length - 1 && direction > 0)
      ) {
        return false;
      } else {
        let newIndex = currIndex - direction;
        let nextPrefix = prefixArr[newIndex] as UnitPrefixes;
        return this.scaleTo(nextPrefix);
      }
    }
  }

  /**
   * Function to convert between bases of the same unit type (e.g min to s, MPa to atm, etc.)
   */
  convertToNewBase(newUnit: string) {
    const newUnitGroups = parseUnit(newUnit);

    if (newUnitGroups.exponent !== this.exponent) {
      const errMsg = 'Exponents should be the same when changing base!';
      throw new Error(errMsg);
    }

    const newBaseFactor = units[newUnitGroups.base];

    if (newBaseFactor[1] === this.type[1]) {
      const currentPrefixFactor = new Big(this.scaleTo('base'));
      const currentBaseFactor = new Big(this.type[0]);

      const newPrefixFactor = prefixes[newUnitGroups.prefix];

      const prefixConvFactor = currentPrefixFactor.div(newPrefixFactor);
      const baseConvFactor = currentBaseFactor.div(newBaseFactor[0]);

      const totalConvFactor = prefixConvFactor
        .times(baseConvFactor)
        .pow(newUnitGroups.exponent);

      this.type = newBaseFactor;
      this.unit = this.buildUnitString(
        newUnitGroups.prefix,
        newUnitGroups.base,
        newUnitGroups.exponent
      );
      this.prefix = newUnitGroups.prefix;
      this.base = newUnitGroups.base;
      this.exponent = newUnitGroups.exponent;
      this.prefix_factor = prefixes[newUnitGroups.prefix];
      this.conversion_factor = totalConvFactor;

      return totalConvFactor.toNumber();
    } else {
      const errMsg = `Invalid base conversion ${this.base} to ${newUnitGroups.base}`;
      throw new Error(errMsg);
    }
  }

  /**
   * logic for handling unit strings based on exponent value
   */
  private buildUnitString(
    prefix: UnitPrefixes,
    base: UnitBases,
    exponent: number
  ) {
    let prefixString = prefix === 'base' ? '' : prefix;
    switch (true) {
      case (exponent > 1 || exponent < 0) && prefix === 'base':
        return `${base}^${exponent}`;
      case (exponent > 1 || exponent < 0) && prefix !== 'base':
        return `${prefixString}${base}^${exponent}`;
      case exponent === 1 && prefix === 'base':
        return `${base}`;
      case exponent === 1 && prefix !== 'base':
        return `${prefixString}${base}`;
      default:
        throw new Error(
          `Unhandled base unit string: ${prefix} ${base} ${exponent}`
        );
    }
  }

  /**
   * Inverts value of exponent and adjusts unit string
   */
  invertBaseUnit() {
    let { prefix, base } = this;
    let newExponent = -this.exponent;
    let newUnit = this.buildUnitString(prefix, base, newExponent);
    this.unit = newUnit;
    this.exponent = newExponent;
    this.conversion_factor = this._prefix_factor.pow(newExponent);
  }

  /**
   * converts unit to its base type (g, mol, l, etc.)
   */
  convertToBaseType() {
    if (this.base === this.type[2] && this.prefix === 'base') {
      return this.prefix_factor;
    } else if (this.base === this.type[2]) {
      return this.scaleTo('base');
    } else {
      return this.convertToNewBase(this.type[2] as UnitBases);
    }
  }

  /**
   * retries all information for the base unit
   */
  output() {
    let { prefix, base, exponent, type } = this;
    return { prefix, base, exponent, type };
  }
}
