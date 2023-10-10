import { Atom } from "./atom";
import { Bond } from "./bond";
import { StochasticFragment, StochasticObject } from "./stochastic";
import { BondDescriptorAtom } from "./bond-descriptor";
import { AstContainer, BigSMILES } from "../bigsmiles";
import { AstComponent } from "../bigsmiles";

/**
 * Represents a branch within a SMILES string or StochasticFragment
 */
export class Branch
  implements
    AstComponent,
    AstContainer<Atom | Bond | Branch | StochasticObject | BondDescriptorAtom>
{
  id_: number;
  nodes: (Atom | Bond | Branch | StochasticObject | BondDescriptorAtom)[] = [];
  parent: BigSMILES | StochasticFragment | Branch;
  _tree_print_repr = false;

  constructor(parent: BigSMILES | StochasticFragment | Branch, id_: number) {
    this.id_ = id_;
    this.parent = parent;
  }

  get inStochasticObject(): boolean {
    return this.parent.inStochasticObject;
  }

  get root(): BigSMILES {
    return this.parent.root;
  }

  toString(): string {
    const branchStr = this.nodes.map((el) => el.toString()).join("");
    return `(${branchStr})`;
  }

  print(): string {
    // let branchStr = this.nodes.map((el) => el.print()).join(" ");
    const text = `Branch ${this.id_}:`;
    return text;
  }
}
