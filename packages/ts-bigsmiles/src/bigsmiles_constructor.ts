import {
  Bond,
  Atom,
  BondDescriptor,
  Branch,
  StochasticFragment,
  StochasticObject,
  BondDescriptorAtom,
} from "./components";
import { BigSMILESError } from "./errors";
import { runValidation } from "./validation";
import { BigSMILES } from "./bigsmiles";
import { Stack } from "./stack";
import { logger } from "./logger";

export enum States {
  start,
  atom,
  bond_descriptor,
  branch_start,
  branch,
  ring,
  stochastic_fragment,
  stochastic_object_start,
  stochastic_object_end,
  stochastic_object,
}

function checkAtomForMakingBond(bond: Bond, atom: Atom) {
  logger.debug(`adding ${bond.print()} to ${atom.print()}`);
  if (atom.bondsAvailable === null) {
    atom.bonds.push(bond);
    return;
  } else if (atom.bondsAvailable === 0) {
    if (
      atom.valence === atom.possibleValence ||
      (atom.possibleValence &&
        atom.valence &&
        atom.possibleValence < atom.valence + bond.type_)
    ) {
      throw new BigSMILESError(
        `Too many bonds are trying to be made. ${atom.print()}, ${
          atom.bondsAvailable
        } ${atom.valence}`
      );
    }

    for (const val of (bond.atom1 as Atom).valence_possible) {
      if (atom.valence && val > atom.valence) {
        atom.valence = val;
        break;
      }
    }
  }
  atom.bonds.push(bond);
}

function addBondToConnectedObjects(bond: Bond) {
  for (const obj of bond) {
    if (obj instanceof Atom) {
      checkAtomForMakingBond(bond, obj);
    } else if (obj instanceof BondDescriptorAtom) {
      obj.bond = bond;
    }
  }
}

function addBondDescriptorToSchoasticFragment(
  stoch_frag: StochasticFragment,
  loop_obj: Branch | StochasticFragment | null = null
) {
  if (loop_obj === null) {
    loop_obj = stoch_frag;
  }

  for (const obj of loop_obj.nodes) {
    if (
      obj instanceof BondDescriptorAtom &&
      !stoch_frag.bonding_descriptors.includes(obj.descriptor)
    ) {
      stoch_frag.bonding_descriptors.push(obj.descriptor);
    }

    if (obj instanceof Branch) {
      addBondDescriptorToSchoasticFragment(stoch_frag, obj);
    }
  }
}

export class BigSMILESConstructor {
  bigsmiles: BigSMILES;
  atom_counter = 0;
  bond_counter = 0;
  bond_descriptor_atom = 0;
  branch_counter = 0;
  stochastic_fragment = 0;
  stochastic_object = 0;
  state = States.start;
  stack = new Stack<
    BigSMILES | StochasticObject | StochasticFragment | Branch
  >();

  constructor(obj: BigSMILES) {
    this.bigsmiles = obj;
    this.stack.push(obj);
  }

  private _getAtomId() {
    let currentId = this.atom_counter;
    this.atom_counter++;
    return currentId;
  }

  private _getBondId() {
    let currentId = this.bond_counter;
    this.bond_counter++;
    return currentId;
  }

  private _getBondDescriptorAtomId() {
    let currentId = this.bond_descriptor_atom;
    this.bond_descriptor_atom++;
    return currentId;
  }

  private _getBranchId() {
    let currentId = this.branch_counter;
    this.branch_counter++;
    return currentId;
  }

  private _getStochasticFragmentId() {
    let currentId = this.stochastic_fragment;
    this.stochastic_fragment++;
    return currentId;
  }

  private _getStochasticObjectId() {
    let currentId = this.stochastic_object;
    this.bond_counter++;
    return currentId;
  }

  private _getRingParent(): BigSMILES | StochasticFragment | undefined {
    for (const node of this.stack) {
      if ("rings" in node) {
        return node;
      }
    }
  }

  private _getBondingDescriptorAtom(bd_symbol: string): BondDescriptorAtom {
    let bd = this._getBondingDescriptor(bd_symbol);
    return new BondDescriptorAtom(bd, this._getBondDescriptorAtomId());
  }

  private _getBondingDescriptor(bd_symbol: string): BondDescriptor {
    const stoch_obj = this._getCurrentStochasticObject();

    for (const bd of stoch_obj.bonding_descriptors) {
      if (bd_symbol === bd._text) {
        return bd;
      }
    }

    const new_bd = new BondDescriptor(stoch_obj, bd_symbol);
    stoch_obj.bonding_descriptors.push(new_bd);
    return new_bd;
  }

  private _getCurrentStochasticObject() {
    for (const obj of this.stack) {
      if (obj instanceof StochasticObject) {
        return obj;
      }
    }

    throw new BigSMILESError(`Coding error.`);
  }

  private _getPriorAtom(
    obj: BigSMILES | StochasticObject | StochasticFragment | Branch
  ): Atom {
    let nodesLength = obj.nodes.length - 1;
    for (let i = nodesLength; i >= 0; i--) {
      let node = obj.nodes[i];
      if (node instanceof Atom) {
        return node;
      }
    }

    if (obj instanceof BigSMILES) {
      throw new BigSMILESError(`Cannot find atom to bond to...`);
    }

    return this._getPriorAtom(obj.parent);
  }

  private _getPriorStochasticAtom(
    obj: BigSMILES | StochasticObject | StochasticFragment | Branch
  ) {
    let nodesLength = obj.nodes.length - 1;
    for (let i = nodesLength; i >= 0; i--) {
      let node = obj.nodes[i];
      if (
        node instanceof Atom ||
        node instanceof BondDescriptorAtom ||
        node instanceof StochasticObject
      ) {
        return node;
      }
    }

    if (obj instanceof BigSMILES) {
      throw new BigSMILESError(`Unable to find prior stochastic atom...`);
    }

    return this._getPriorAtom(obj.parent);
  }

  private inStochasticObject() {
    const parent = this.stack.peek();
    if (!parent.inStochasticObject) {
      throw new BigSMILESError(`Must be in a StochasticObject`);
    }
    return parent as StochasticObject | StochasticFragment | Branch;
  }

  addRing(ring_id: number): Bond {
    let ringParent = this._getRingParent();

    //check if ring exists
    if (!ringParent) {
      throw new BigSMILESError(
        `Cannot find valid ring parent for ring id: ${ring_id}!`
      );
    }

    for (const ring of ringParent.rings) {
      if (ring.ring_id === ring_id) {
        if (ring.atom2) {
          throw new BigSMILESError(
            `Ring already formed for ring id ${ring_id}`
          );
        }
        const priorElement = this.stack.peek();
        let priorRingAtom = this._getPriorAtom(priorElement);
        ring.atom2 = priorRingAtom;
        addBondToConnectedObjects(ring);
        return ring;
      }
    }

    //create new ring
    let first = this.stack.peek();
    let parentAtom = this._getPriorAtom(first);
    let bond = new Bond("", parentAtom, null, this._getBondId(), ring_id);
    this.bigsmiles.bonds.push(bond);
    ringParent.rings.push(bond);

    return bond;
  }

  addAtom(symbol: string): Atom {
    const atom = new Atom(symbol, this._getAtomId());
    const parent = this.stack.peek();

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(`Cannot add Atom to StochasticObject`);
    }

    parent.nodes.push(atom);
    this.bigsmiles.atoms.push(atom);

    this.state = States.atom;
    return atom;
  }

  addBond(
    bond_symbol: string,
    atom1: Atom | BondDescriptorAtom | StochasticObject,
    atom2: Atom | BondDescriptorAtom | StochasticObject | null
  ): Bond {
    const bond = new Bond(bond_symbol, atom1, atom2, this._getBondId());
    const parent = this.stack.peek();

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(`Cannot add Bond to StochasticObject`);
    }

    parent.nodes.push(bond);
    addBondToConnectedObjects(bond);
    return bond;
  }

  addBondingDescriptor(bd_symbol: string): BondDescriptorAtom {
    const parent = this.inStochasticObject();
    const bd_atom = this._getBondingDescriptorAtom(bd_symbol);

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(
        `Cannot add BondingDescriptorAtom to StochasticObject`
      );
    }

    parent.nodes.push(bd_atom);
    this.state = States.bond_descriptor;
    return bd_atom;
  }

  addBondAtomPair(bond_symbol: string, atom_symbol: string): [Bond, Atom] {
    const atom = new Atom(atom_symbol, this._getAtomId());
    logger.silly(`next atom ${atom}`);
    const parent = this.stack.peek();
    const prior_atom = this._getPriorStochasticAtom(parent);
    logger.silly(`prior atom is ${prior_atom}`);

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(`Cannot add Atom to StochasticObject`);
    }

    const bond = this.addBond(bond_symbol, prior_atom, atom);
    parent.nodes.push(atom);
    this.bigsmiles.atoms.push(atom);
    this.state = States.atom;
    return [bond, atom];
  }

  addBondBondingDescriptorPair(
    bond_symbol: string,
    bd_symbol: string
  ): [Bond, BondDescriptorAtom] {
    const parent = this.inStochasticObject();
    const bd_atom = this._getBondingDescriptorAtom(bd_symbol);
    const prior_atom = this._getPriorStochasticAtom(parent);

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(
        `Cannot add BondingDescriptor Atom to StochasticObject`
      );
    }

    const bond = this.addBond(bond_symbol, prior_atom, bd_atom);
    parent.nodes.push(bd_atom);
    this.state = States.bond_descriptor;
    return [bond, bd_atom];
  }

  openBranch() {
    const parent = this.stack.peek();

    if (parent instanceof Branch && parent.nodes.length === 0) {
      throw new BigSMILESError(
        "BigSMILES string or branch can't start with a branch"
      );
    }

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(`Cannot start a branch with a StochasticObject`);
    }

    const branch = new Branch(parent, this._getBranchId());
    parent.nodes.push(branch);

    this.stack.push(branch);
    this.state = States.branch_start;
  }

  closeBranch() {
    const parent = this.stack.peek();

    if (!(parent instanceof Branch)) {
      throw new BigSMILESError(
        `Error closing branch. Possible issues:\n\tClosing a branch with another intermediate node started.\n\tNo starting branch symbol`
      );
    }
    this.stack.pop();
  }

  openStochasticObject(bd_symbol: string): StochasticFragment {
    const parent = this.stack.peek();

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(
        `StochasticObject cannot be the parent of StochasticObject`
      );
    }

    const stoch_obj = new StochasticObject(
      parent,
      this._getStochasticObjectId()
    );

    const new_bd = new BondDescriptor(stoch_obj, bd_symbol);
    stoch_obj.bonding_descriptors.push(new_bd);
    stoch_obj.end_group_left = new BondDescriptorAtom(
      new_bd,
      this._getBondDescriptorAtomId()
    );
    parent.nodes.push(stoch_obj);
    this.stack.push(stoch_obj);

    const stoch_frag = new StochasticFragment(
      stoch_obj,
      this._getStochasticFragmentId()
    );

    stoch_obj.nodes.push(stoch_frag);
    this.stack.push(stoch_frag);
    this.state = States.stochastic_fragment;
    return stoch_frag;
  }

  openStochasticObjectWithBond(bond_symbol: string, bd_symbol: string) {
    const parent = this.stack.peek();

    if (parent instanceof StochasticObject) {
      throw new BigSMILESError(
        `StochasticObject cannot be direct parent of StochasticObject`
      );
    }

    const stoch_obj = new StochasticObject(
      parent,
      this._getStochasticObjectId()
    );

    const new_bd = new BondDescriptor(stoch_obj, bd_symbol);
    stoch_obj.bonding_descriptors.push(new_bd);
    stoch_obj.end_group_left = new BondDescriptorAtom(
      new_bd,
      this._getBondDescriptorAtomId()
    );

    const prior_atom = this._getPriorStochasticAtom(parent);
    const bond = new Bond(
      bond_symbol,
      prior_atom,
      stoch_obj,
      this._getBondId()
    );
    stoch_obj.bond_left = bond;
    parent.nodes.push(stoch_obj);
    this.stack.push(stoch_obj);
    return this.openStochasticFragment();
  }

  closeStochasticObject(bd_symbol: string) {
    const parent = this.stack.peek();
    if (!(parent instanceof StochasticObject)) {
      throw new BigSMILESError(
        `Error closing StochasticObject. Possible issues:\n\tClosing a StochasticObject with another intermediate node started.\n\tNo starting StochasticObject symbol`
      );
    }

    parent.end_group_right = this._getBondingDescriptorAtom(bd_symbol);
    this.stack.pop();
  }

  openStochasticFragment() {
    const parent = this.inStochasticObject();

    if (!(parent instanceof StochasticObject)) {
      throw new BigSMILESError(
        `StochasticFragment requires a StochasticObject as parent`
      );
    }

    const stoch_frag = new StochasticFragment(
      parent,
      this._getStochasticFragmentId()
    );
    parent.nodes.push(stoch_frag);
    this.stack.push(stoch_frag);
    this.state = States.stochastic_fragment;
    return stoch_frag;
  }

  closeOpenStochasticFragment() {
    const parent = this.inStochasticObject();
    if (!(parent instanceof StochasticFragment)) {
      throw new Error(
        `Stochastic separator can only follow stochastic fragments`
      );
    }
    this.closeStochasticFragment();
    return this.openStochasticFragment();
  }

  closeStochasticFragment() {
    const parent = this.inStochasticObject();
    if (!(parent instanceof StochasticFragment)) {
      throw new Error(
        `Error closing StochasticFragment branch. Possible issues:\n\tClosing a StochasticObject with another intermediate node started.`
      );
    }

    addBondDescriptorToSchoasticFragment(parent);

    if (!parent.bonding_descriptors.length) {
      throw new BigSMILESError(
        `No bonding descriptor in the stochastic fragment`
      );
    }
    this.stack.pop();
  }

  finalValidation() {
    if (this.stack.size !== 1) {
      throw new BigSMILESError(`Missing a closing symbol`);
    }

    runValidation(this.bigsmiles);
  }
}
