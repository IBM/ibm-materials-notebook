import { CmdlToken } from "../../cmdl-parser-types";
import {
  BaseError,
  InvalidPropertyError,
  MissingValueError,
  RangeError,
} from "../../errors";
import { Property, Group } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../../symbols";
import { ModelVisitor } from "../../symbols";
import Big from "big.js";

/**
 * Handles numberical properties within CMDL Record Trees
 */
export class NumericalProperty extends Property {
  protected value: string | null = null;
  protected valueToken?: CmdlToken;
  protected unit?: string;
  protected unitToken?: CmdlToken;
  protected uncertainty?: string;
  protected uncertaintyToken?: CmdlToken;

  constructor(token: CmdlToken) {
    super(token);
  }

  /**
   * Sets token and value for the numerical property
   * @param val string
   * @param token CmdlToken
   */
  public setValue(val: string, token: CmdlToken): void {
    this.value = val;
    this.valueToken = token;
  }

  /**
   * Sets unit token and unit value for the numerical property
   * @param unit string
   * @param unitToken CmdlToken
   */
  public setUnit(unit: string, unitToken: CmdlToken): void {
    this.unit = unit;
    this.unitToken = unitToken;
  }

  /**
   * Sets uncertainty token and value for the numerical property
   * @param value string
   * @param token CmdlToken
   */
  public setUncertainty(value: string, token: CmdlToken): void {
    this.uncertainty = value;
    this.uncertaintyToken = token;
  }

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();
    this.validateUnit();
    this.validateValue();

    return this.errors;
  }

  /**
   * Validates the value of the numerical property
   * @returns void
   */
  private validateValue(): void {
    let msg: string;
    let err: BaseError;
    if (!this.propertyType) {
      return;
    }

    if (this.unit && !this.propertyType?.units?.length) {
      msg = `${this.name} does not contain units`;
      err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    if (this.propertyType?.min && Number(this.value) < this.propertyType.min) {
      msg = `${this.value} is less than the minimum value for this property`;
      err = new RangeError(msg, this.valueToken);
      this.errors.push(err);
    }

    if (this.propertyType?.max && Number(this.value) > this.propertyType.max) {
      msg = `${this.value} is greater than the maximum value for this property`;
      err = new RangeError(msg, this.valueToken);
      this.errors.push(err);
    }
  }

  /**
   * Validates unit of numerical property
   * @returns void
   */
  private validateUnit(): void {
    let msg: string;
    let err: BaseError;
    if (!this.propertyType) {
      return;
    }

    if (!this.unit && this.propertyType?.units?.length) {
      msg = `${this.name} is missing a unit`;
      err = new MissingValueError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    if (this.unit) {
      if (!this.propertyType?.units?.length) {
        msg = `${this.name} is a unitless property`;
        err = new InvalidPropertyError(msg, this.nameToken);
        this.errors.push(err);
        return;
      }

      if (!this.propertyType.units.includes(this.unit)) {
        msg = `${this.unit} is not an allowable unit on ${this.name}`;
        err = new InvalidPropertyError(msg, this.nameToken);
        this.errors.push(err);
        return;
      }

      const unitType = this.typeManager.getUnit(this.unit);

      if (!unitType) {
        msg = `${this.unit} is an unrecognized unit type`;
        err = new InvalidPropertyError(msg, this.unitToken);
        this.errors.push(err);
        return;
      }

      if (Number(this.value) > unitType.max && !this.propertyType.max) {
        msg = `${this.value} is greater than the maximum value for this property`;
        err = new RangeError(msg, this.valueToken);
        this.errors.push(err);
      }

      if (Number(this.value) < unitType.min && !this.propertyType.min) {
        msg = `${this.value} is less than the minimum value for this property`;
        err = new RangeError(msg, this.valueToken);
        this.errors.push(err);
      }
    }
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitProperty(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitProperty(this);
    }
  }

  public print(): Record<string, any> {
    let parentName = null;

    if (this.parent && this.parent instanceof Group) {
      parentName = this.parent.name;
    }

    return {
      name: this.name,
      value: this.value,
      unit: this.unit || null,
      uncertainty: this.uncertainty || null,
      parent: parentName,
    };
  }

  public getValues(): {
    value: Big;
    unit: string | null;
    uncertainty: Big | null;
  } {
    if (!this.value) {
      throw new Error(`${this.name} has no value!`);
    }

    return {
      value: Big(this.value),
      unit: this.unit || null,
      uncertainty: this.uncertainty ? Big(this.uncertainty) : null,
    };
  }
}
