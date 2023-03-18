import { Atom } from "./atom";
import { Bond } from "./bond";
import { Branch } from "./branch";
import {
  BondDescriptorAtom,
  BondDescriptor,
  BondDescriptorTypes,
} from "./bond-descriptor";
import { AstContainer, BigSMILES } from "../bigsmiles";
import { AstComponent } from "../bigsmiles";
import { logger } from "../logger";

/**
 * Represents a stochastic fragment within a BigSMILES string
 */
export class StochasticFragment
  implements
    AstComponent,
    AstContainer<Atom | Bond | Branch | StochasticObject | BondDescriptorAtom>
{
  id_: number;
  nodes: (Atom | Bond | Branch | StochasticObject | BondDescriptorAtom)[] = [];
  parent: StochasticObject;
  rings: Bond[] = [];
  bonding_descriptors: BondDescriptor[] = [];

  constructor(parent: StochasticObject, id_: number) {
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
    return this.nodes.map((el) => el.toString()).join("");
  }

  print(): string {
    let fragmentStr = this.nodes.map((el) => el.print()).join(" ");
    return fragmentStr;
  }
}

export class StochasticObject
  implements AstComponent, AstContainer<StochasticFragment>
{
  id_: number;
  nodes: StochasticFragment[] = [];
  bonding_descriptors: BondDescriptor[] = [];
  end_group_left: BondDescriptorAtom | null = null;
  end_group_right: BondDescriptorAtom | null = null;
  bond_left: Bond | null = null;
  bond_right: Bond | null = null;
  parent: BigSMILES | StochasticFragment | Branch;

  constructor(parent: BigSMILES | StochasticFragment | Branch, id_: number) {
    this.id_ = id_;
    this.parent = parent;
  }

  get implicitEndgroups(): boolean {
    if (
      (this.end_group_left &&
        this.end_group_left.descriptor.type_ ===
          BondDescriptorTypes.Implicit) ||
      (this.end_group_right &&
        this.end_group_right.descriptor.type_ === BondDescriptorTypes.Implicit)
    ) {
      return true;
    } else {
      return false;
    }
  }

  get inStochasticObject(): boolean {
    return true;
  }

  get root(): BigSMILES {
    return this.parent.root;
  }

  toString(): string {
    const fragments = this.nodes.map((el) => el.toString()).join(",");
    const end_group_left = this.end_group_left
      ? this.end_group_left.toString()
      : "";
    const end_group_right = this.end_group_right
      ? this.end_group_right.toString()
      : "";
    const stochObjStr = `{${end_group_left}${fragments}${end_group_right}}`;
    return stochObjStr;
  }

  print(): string {
    let fragmentStr = this.nodes.map((el) => el.print()).join(", ");
    const end_group_left = this.end_group_left
      ? this.end_group_left.print()
      : "";
    const end_group_right = this.end_group_right
      ? this.end_group_right.print()
      : "";
    return `StochasticObject: {${end_group_left}${fragmentStr}${end_group_right}}`;
  }
}
