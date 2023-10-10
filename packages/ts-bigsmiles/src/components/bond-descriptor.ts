import { AstComponent, BaseComponent } from "../bigsmiles";
import { BigSMILESError } from "../errors";
import { StochasticObject } from "./stochastic";
import { Bond } from "./bond";

export enum BondDescriptorTypes {
  Left = "<",
  Right = ">",
  Dollar = "$",
  Implicit = "",
}

function processBondingDescriptorSymbol(symbol: string): [string, number] {
  const bracket_regex = new RegExp(/\[|\]/g);
  const processedSymbol = symbol.replaceAll(bracket_regex, "");

  if (!processedSymbol.length) {
    return [processedSymbol, 0];
  }

  const last = Number(processedSymbol.slice(-1));
  if (last) {
    return [processedSymbol[0], last];
  }

  return [processedSymbol, 0];
}

/**
 * Class for representing bond descriptor within a BigSMILES string
 */
export class BondDescriptor implements BaseComponent {
  symbol: string;
  _text: string;
  type_: BondDescriptorTypes;
  index_: number;
  stochastic_object: StochasticObject;
  instances: BondDescriptorAtom[] = [];

  constructor(stochastic_object: StochasticObject, symbol: string) {
    const [processedSymbol, index] = processBondingDescriptorSymbol(symbol);
    this._text = symbol;
    this.symbol = processedSymbol;
    this.stochastic_object = stochastic_object;
    this.type_ = this.setBDType(processedSymbol);
    this.index_ = index;
  }

  setBDType(symbol: string): BondDescriptorTypes {
    if (!symbol.length) {
      return BondDescriptorTypes.Implicit;
    } else if (symbol === BondDescriptorTypes.Dollar) {
      return BondDescriptorTypes.Dollar;
    } else if (symbol === BondDescriptorTypes.Left) {
      return BondDescriptorTypes.Left;
    } else if (symbol === BondDescriptorTypes.Right) {
      return BondDescriptorTypes.Right;
    } else {
      throw new BigSMILESError(
        `Invalid bond descriptor type symbol: ${symbol}`
      );
    }
  }

  isPair(bd: BondDescriptor): boolean {
    if (this.index_ === bd.index_) {
      if (
        (this.type_ === BondDescriptorTypes.Left &&
          bd.type_ === BondDescriptorTypes.Right) ||
        (this.type_ === BondDescriptorTypes.Right &&
          bd.type_ === BondDescriptorTypes.Left)
      ) {
        return true;
      }
    }
    return false;
  }
  print(): string {
    return `[${this.symbol}${this.index_}]`;
  }

  toString(): string {
    return `${this._text}`;
  }
}

/**
 * Represents a bond descriptor atom within a BigSMILES string
 *
 */
export class BondDescriptorAtom implements AstComponent {
  id_: number;
  bond: Bond | null = null;
  descriptor: BondDescriptor;
  _tree_print_repr = true;

  constructor(bond_descriptor: BondDescriptor, id_: number) {
    this.descriptor = bond_descriptor;
    this.id_ = id_;
    bond_descriptor.instances.push(this);
  }

  toString(): string {
    return this.descriptor.toString();
  }

  print(): string {
    return `${this.descriptor.toString()}{${this.id_}}`;
  }
}
