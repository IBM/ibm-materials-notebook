import { Atom } from "./atom";
import { StochasticObject } from "./stochastic";
import { BondDescriptorAtom } from "./bond-descriptor";
import { AstComponent } from "../bigsmiles";
import { BigSMILESError } from "../errors";
import { logger } from "../logger";

export enum BondType {
  single = 1,
  double,
  triple,
}

const bond_mapping: Record<string, BondType> = {
  "": BondType.single,
  "=": BondType.double,
  "#": BondType.triple,
};

/**
 * Represents a bond within a BigSMILES or SMILES string
 */
export class Bond implements AstComponent {
  id_: number;
  ring_id: number | null;
  symbol: string;
  type_: BondType;
  atom1: Atom | BondDescriptorAtom | StochasticObject;
  atom2: Atom | BondDescriptorAtom | StochasticObject | null;
  _tree_print_repr = true;

  constructor(
    symbol: string,
    atom1: Atom | BondDescriptorAtom | StochasticObject,
    atom2: Atom | BondDescriptorAtom | StochasticObject | null = null,
    id_: number,
    ring_id: number | null = null
  ) {
    if (!atom1) {
      throw new BigSMILESError(`Atom1 cannot be undefined or null`);
    }

    this.id_ = id_;
    this.ring_id = ring_id;
    this.symbol = symbol;
    this.atom1 = atom1;
    this.atom2 = atom2;
    this.type_ = bond_mapping[symbol];
  }

  *[Symbol.iterator]() {
    const atoms = [this.atom1, this.atom2];
    for (const atom of atoms) {
      yield atom;
    }
  }

  toString(): string {
    return this.symbol;
  }

  private getAtomText(atom: Atom | BondDescriptorAtom | StochasticObject) {
    if (atom instanceof Atom) {
      return "A";
    } else if (atom instanceof BondDescriptorAtom) {
      return "BD";
    } else if (atom instanceof StochasticObject) {
      return "SO";
    } else {
      logger.warn(`atom is weird...${atom}`, { meta: atom });
      throw new BigSMILESError(`Unknown atom type ${atom}`);
    }
  }

  print(): string {
    const atom1Txt = this.getAtomText(this.atom1);

    let text = `Bond: {${this.id_}|${atom1Txt}${this.atom1?.id_ || ""}-`;

    if (this.atom2) {
      const atom2Txt = this.getAtomText(this.atom2);
      text += `>${atom2Txt}${this.atom2.id_}}`;
    }

    return text;
  }
}
