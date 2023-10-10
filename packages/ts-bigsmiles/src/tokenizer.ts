import { Config } from "./config";
import { BigSMILESError } from "./errors";
import { logger } from "./logger";

/**
 * Raised when during tokenizing a BigSMILES string
 */
class BigSMILESTokenizerError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export enum TokenKind {
  Bond = "Bond",
  Atom = "Atom",
  Aromatic = "Aromatic",
  AtomExtend = "AtomExtend",
  BranchStart = "BranchStart",
  BranchEnd = "BranchEnd",
  Ring = "Ring",
  Ring2 = "Ring2",
  BondEZ = "BondEZ",
  Mix = "Mix",
  Rxn = "Rxn",
  BondDescriptor = "BondDescriptor",
  StochasticSeperator = "StochasticSeperator",
  StochasticStart = "StochasticStart",
  StochasticEnd = "StochasticEnd",
  ImplictEndGroup = "ImplictEndGroup",
  BondDescriptorLadder = "BondDescriptorLadder",
  MISMATCH = "MISMATCH",
  SKIP = "SKIP",
}
const _element_string = Config.elements_ordered.join("|");
const _atom_pattern = new RegExp(_element_string);
const _aromatic_string = Config.aromatic.join("|");
const _aromatic_pattern = new RegExp(_aromatic_string);
const _element_pattern_string = `(?<element>${_element_string}|${_aromatic_string}{1})`;
const _isotope_pattern = new RegExp(/(?<isotope>[\d]{1,3})?/);
const _element_pattern = new RegExp(_element_pattern_string);
const _stereo_pattern = new RegExp(/(?<stereo>@{1,2})?/);
const _hydrogen_pattern = new RegExp(/(?<hcount>H[\d]?)?/);
const _charge_pattern = new RegExp(/(?<charge>[-|+]{1,3}[\d]?)?/);
const atom_pattern_string = `(?:[)${_isotope_pattern.source}${_element_pattern.source}${_stereo_pattern.source}${_hydrogen_pattern.source}${_charge_pattern.source}(?:])`;
const atom_extend_pattern = new RegExp(atom_pattern_string);

const _bond_pattern = new RegExp(/[=|#]/);
const _branch_start_pattern = new RegExp(/\(/);
const _branch_end_pattern = new RegExp(/\)/);
const _ring_pattern = new RegExp(/[\d]{1}/);
const _ring2_pattern = new RegExp(/%[\d]{2}/);
const _bondEZ_pattern = new RegExp(/\/|\\/);
const _mix_pattern = new RegExp(/\./);
const _rxn_pattern = new RegExp(/>>|>/);
const _ladder_pattern = new RegExp(/\[[$<>][\d]\[[$<>][\d]?\][\d]?\]/);
const _bond_descriptor_pattern = new RegExp(/\[[$<>][\d]?[\d]?\]/);
const _stochastic_separator_pattern = new RegExp(/,|;/);
const _stochastic_start_pattern = new RegExp(/\{/);
const _stochastic_end_pattern = new RegExp(/\}/);
const _implicit_end_group_pattern = new RegExp(/\[\]/);
const _skip_pattern = new RegExp(/[\t]+/);
const _mismatch_pattern = new RegExp(/./);

const token_specification: [TokenKind, RegExp][] = [
  [TokenKind.Bond, _bond_pattern],
  [TokenKind.Atom, _atom_pattern],
  [TokenKind.Aromatic, _aromatic_pattern],
  [TokenKind.AtomExtend, atom_extend_pattern],
  [TokenKind.BranchStart, _branch_start_pattern],
  [TokenKind.BranchEnd, _branch_end_pattern],
  [TokenKind.Ring, _ring_pattern],
  [TokenKind.Ring2, _ring2_pattern],
  [TokenKind.BondEZ, _bondEZ_pattern],
  [TokenKind.Mix, _mix_pattern],
  [TokenKind.Rxn, _rxn_pattern],
  [TokenKind.BondDescriptorLadder, _ladder_pattern],
  [TokenKind.BondDescriptor, _bond_descriptor_pattern],
  [TokenKind.StochasticSeperator, _stochastic_separator_pattern],
  [TokenKind.StochasticStart, _stochastic_start_pattern],
  [TokenKind.StochasticEnd, _stochastic_end_pattern],
  [TokenKind.ImplictEndGroup, _implicit_end_group_pattern],
  [TokenKind.SKIP, _skip_pattern],
  [TokenKind.MISMATCH, _mismatch_pattern],
];

const full_token_string = token_specification
  .map(([kind, regex]) => `(?<${kind}>${regex.source})`)
  .join("|");
const token_regex = new RegExp(full_token_string, "g");

export class Token {
  kind: TokenKind;
  value: string;

  constructor(kind: TokenKind, value: string) {
    this.kind = kind;
    this.value = value;
  }

  print() {
    return `${this.kind}: ${this.value}`;
  }
}

export function tokenize(text: string): Token[] {
  logger.info(`Starting tokenization of ${text}`);
  const result: any = [];
  let prior = 0;

  const matches = text.trim().matchAll(token_regex);

  for (const match of matches) {
    if (!match?.groups) {
      throw new BigSMILESError(`Matching groups are undefined!`);
    }

    const groupNames = Object.keys(match.groups).filter((key) =>
      match?.groups ? match.groups[key] : false
    );

    if (groupNames.length > 1) {
      //raise error
      logger.warn(`Bad group capture...`, { meta: groupNames });
    }

    const kind = groupNames[0];
    const value = match.groups[kind];

    if (kind === TokenKind.SKIP) {
      continue;
    } else if (kind === TokenKind.MISMATCH) {
      throw new BigSMILESTokenizerError(
        `Invalid symbol or group of symbols, starting at ${match.index} to ${
          match.index + value
        } and forward`
      );
    } else if (prior !== match.index) {
      throw new BigSMILESTokenizerError(
        `issue tokenizing range: ${prior} to ${prior + value.length}`
      );
    }

    prior = match.index + value.length;

    const newToken = new Token(kind as TokenKind, value);
    result.push(newToken);
  }

  logger.info(`Tokenization complete for ${text}`);
  return result;
}
