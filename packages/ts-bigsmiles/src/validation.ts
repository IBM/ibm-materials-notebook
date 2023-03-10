import { BigSMILESError } from "./errors";
import {
  BondDescriptorTypes,
  StochasticObject,
  StochasticFragment,
  BondDescriptor,
  Branch,
} from "./components";
import { BigSMILES } from "./bigsmiles";
import { logger } from "./logger";

export function runValidation(bigsmiles: BigSMILES) {
  checkRingClosure(bigsmiles);
  checkBondingdescriptors(bigsmiles);
  checkImplicitEndgroupsEnds(bigsmiles);
}

function checkRingClosure(bigsmiles: BigSMILES) {
  for (const ring of bigsmiles.rings) {
    if (!ring.atom2) {
      throw new BigSMILESError(
        `Ring opened, but not closed. (ring id: ${ring.ring_id})`
      );
    }
  }
}

function checkBondingdescriptors(bigsmiles: BigSMILES | StochasticObject) {
  for (const node of bigsmiles.nodes) {
    if (node instanceof StochasticObject) {
      doCheckBondingDescriptors(node);
      checkBondingdescriptors(node);
    }
  }
}

function doCheckBondingDescriptors(stoch_obj: StochasticObject) {
  for (const bd of stoch_obj.bonding_descriptors) {
    if (bd.type_ === BondDescriptorTypes.Dollar) {
      if (bd.instances.length <= 1) {
        throw new BigSMILESError(
          `[$] type bonding descriptors require more than one instance in a string`
        );
      }
    }
    if (
      bd.type_ === BondDescriptorTypes.Left ||
      bd.type_ === BondDescriptorTypes.Right
    ) {
      const bd_pair = findComplementingBondingDescriptor(stoch_obj, bd);
      if (!bd_pair) {
        throw new BigSMILESError(`${bd} complementary partner not found`);
      }
    }
  }
}

function findComplementingBondingDescriptor(
  stoch_obj: StochasticObject,
  bond_descr: BondDescriptor
) {
  for (const bd of stoch_obj.bonding_descriptors) {
    if (bond_descr.isPair(bd)) {
      return bd;
    }
  }
  return null;
}

function checkImplicitEndgroupsEnds(
  obj: BigSMILES | StochasticObject | StochasticFragment | Branch,
  parent_obj:
    | BigSMILES
    | StochasticObject
    | StochasticFragment
    | Branch
    | null = null
) {
  for (let i = 0; i < obj.nodes.length; i++) {
    let node = obj.nodes[i];
    if (node instanceof StochasticObject) {
      if (
        node.end_group_left &&
        node.end_group_left.descriptor.type_ === BondDescriptorTypes.Implicit
      ) {
        if (i !== 0) {
          throw new BigSMILESError(
            `With the left group implicit, there should be nothing to the left fof the stochastic object`
          );
        }

        if (parent_obj) {
          throw new BigSMILESError(
            `Implicit left end group not allowed within interior`
          );
        }
      }

      if (
        node.end_group_right &&
        node.end_group_right.descriptor.type_ === BondDescriptorTypes.Implicit
      ) {
        if (i !== obj.nodes.length - 1) {
          throw new BigSMILESError(
            `With an implicit right end group, there should not be anything to the right of it.`
          );
        }
      }
    }

    if ("nodes" in node) {
      checkImplicitEndgroupsEnds(node, obj);
    }
  }
}
