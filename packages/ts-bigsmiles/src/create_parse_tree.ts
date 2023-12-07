import { tokenize, Token, TokenKind } from "./tokenizer";
import { BigSMILESConstructor, States } from "./bigsmiles_constructor";
import { BigSMILESError } from "./errors";
import { logger } from "./logger";
import { BigSMILES } from "./bigsmiles";

type AtomPairState =
  | States.atom
  | States.bond_descriptor
  | States.stochastic_object_end
  | States.branch_start
  | States.ring;

function isAtomPairState(state: States): state is AtomPairState {
  if (
    state === States.atom ||
    state === States.bond_descriptor ||
    state === States.stochastic_object_end ||
    state === States.branch_start ||
    state === States.ring
  ) {
    return true;
  } else {
    return false;
  }
}

function isNotBondDescriptor(
  arg: TokenKind
): arg is Exclude<typeof arg, TokenKind> {
  return arg !== TokenKind.BondDescriptor;
}

function isNotStochasticStart(
  arg: TokenKind
): arg is Exclude<typeof arg, TokenKind> {
  return arg !== TokenKind.StochasticStart;
}

function mapAtom(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  if (constructor.state === States.start) {
    constructor.addAtom(token.value);
  } else if (isAtomPairState(constructor.state)) {
    constructor.addBondAtomPair("", token.value);
  } else if (constructor.state === States.stochastic_fragment) {
    constructor.addAtom(token.value);
  } else {
    throw new BigSMILESError(
      `Invalid constructor state encountered while maping atom: ${token.value} (${token.kind})`
    );
  }
}

function mapBond(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  const nextToken = tokens.shift();

  if (!nextToken) {
    throw new BigSMILESError(`Bond cannot be at end of BigSMILES string`);
  }

  if (
    nextToken.kind === TokenKind.Atom ||
    nextToken.kind === TokenKind.AtomExtend
  ) {
    constructor.addBondAtomPair(token.value, nextToken.value);
  } else if (isNotBondDescriptor(nextToken.kind)) {
    constructor.addBondBondingDescriptorPair(token.value, nextToken.value);
  } else if (isNotStochasticStart(nextToken.kind)) {
    mapStochasticObjectStart(constructor, tokens, nextToken, token);
  } else {
    throw new BigSMILESError(
      `Bonds must be followed by an Atom, Bonding Descriptor, or Stocastic Object. Parse completed: ${
        constructor.bigsmiles
      }, issue token: ${token.print()}`
    );
  }
}

function mapBondDescriptor(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  if (tokens[0].kind === TokenKind.StochasticEnd) {
    constructor.closeStochasticFragment();
    constructor.closeStochasticObject(token.value);
    tokens.shift();
    return;
  }

  if (constructor.state === States.stochastic_fragment) {
    constructor.addBondingDescriptor(token.value);
    return;
  }

  if (constructor.state === States.branch_start) {
    if (tokens[0].kind !== TokenKind.BranchEnd) {
      throw new BigSMILESError(
        `If Bonding Descriptors is the first Branch symbol, it can only be followed by Branch End`
      );
    }
  }

  constructor.addBondBondingDescriptorPair("", token.value);
}

function mapBranchStart(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  constructor.openBranch();
}

function mapBranchEnd(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  constructor.closeBranch();
}

function mapRing(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  if (constructor.state !== States.atom) {
    throw new BigSMILESError(`Ring number must follow atoms`);
  }

  constructor.addRing(parseInt(token.value));
}

function mapStochasticObjectStart(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token,
  bond_token: Token | null = null
) {
  const nextToken = tokens.shift();
  if (!nextToken) {
    throw new BigSMILESError(
      `Stochastic objects must begin with a bond descriptor (or implicit bonding descriptor).`
    );
  }

  if (
    nextToken.kind !== TokenKind.ImplictEndGroup &&
    nextToken.kind !== TokenKind.BondDescriptor
  ) {
    throw new BigSMILESError(
      `Stochastic object starts must be followed an explict or implicit end group.`
    );
  }

  if (constructor.state === States.start) {
    constructor.openStochasticObject(nextToken.value);
  } else {
    if (!bond_token) {
      constructor.openStochasticObjectWithBond("", nextToken.value);
    } else {
      constructor.openStochasticObjectWithBond(
        bond_token.value,
        nextToken.value
      );
    }
  }
}

function mapStochasticObjectEnd(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  throw new BigSMILESError(
    `Stochastic objects should end with bonding descriptor (or implicit bonding description)`
  );
}

function mapBondSeparator(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  constructor.closeOpenStochasticFragment();
}

function NotImplementedFunc() {
  throw new Error(`Not implemented`);
}

function SkipSymbol(
  constructor: BigSMILESConstructor,
  tokens: Token[],
  token: Token
) {
  logger.warn(`Symbol skipped: ${token.value}`);
}

const map_tokens = {
  [TokenKind.Bond]: mapBond,
  [TokenKind.Atom]: mapAtom,
  [TokenKind.Aromatic]: mapAtom,
  [TokenKind.AtomExtend]: mapAtom,
  [TokenKind.BranchStart]: mapBranchStart,
  [TokenKind.BranchEnd]: mapBranchEnd,
  [TokenKind.Ring]: mapRing,
  [TokenKind.Ring2]: mapRing,
  [TokenKind.BondEZ]: SkipSymbol,
  [TokenKind.Mix]: NotImplementedFunc,
  [TokenKind.Rxn]: NotImplementedFunc,
  [TokenKind.MISMATCH]: NotImplementedFunc,
  [TokenKind.SKIP]: SkipSymbol,
  [TokenKind.BondDescriptor]: mapBondDescriptor,
  [TokenKind.StochasticSeperator]: mapBondSeparator,
  [TokenKind.StochasticStart]: mapStochasticObjectStart,
  [TokenKind.StochasticEnd]: mapStochasticObjectEnd,
  [TokenKind.ImplictEndGroup]: mapBondDescriptor,
  [TokenKind.BondDescriptorLadder]: NotImplementedFunc,
};

function tokensToObjects(constructor: BigSMILESConstructor, tokens: Token[]) {
  while (tokens.length) {
    const token = tokens.shift();

    if (!token) {
      break;
    }

    const func = map_tokens[token.kind];
    func(constructor, tokens, token);
  }
  constructor.finalValidation();
}

export function createParseTree(bigsmiles: BigSMILES) {
  const tokens = tokenize(bigsmiles.input_text);
  const constructor = new BigSMILESConstructor(bigsmiles);
  tokensToObjects(constructor, tokens);
}
