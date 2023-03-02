import { Atom, Bond, Branch, StochasticObject } from "./components";
import { createParseTree } from "./create_parse_tree";
import { BigSMILESError } from "./errors";
import { logger } from "./logger";
import { Token } from "./tokenizer";
import { treeToStringLoop } from "./tree_to_string";

export interface BaseComponent {
  toString(): string;
  print(): string;
}

export interface AstComponent extends BaseComponent {
  id_: number;
}

export interface AstContainer<T> extends BaseComponent {
  nodes: T[];
}

/**
 * Top Level Component in BigSMILES AST
 *
 */
export class BigSMILES
  implements AstContainer<Atom | Bond | StochasticObject | Branch>
{
  nodes: (Atom | Bond | StochasticObject | Branch)[] = [];
  atoms: Atom[] = [];
  bonds: Bond[] = [];
  rings: Bond[] = [];
  input_text: string;
  _tokens: Token[] = [];
  _tree_print_repr = false;

  constructor(input_text: string) {
    try {
      this.input_text = input_text;
      createParseTree(this);
    } catch (error) {
      logger.warn(`Error creating parse tree for ${input_text}`);
      throw new BigSMILESError(error as string);
    }
  }

  *[Symbol.iterator]() {
    for (const atom of this.atoms) {
      yield atom;
    }
  }

  get inStochasticObject(): boolean {
    return false;
  }

  get root(): BigSMILES {
    return this;
  }

  getAtom(int: number | [number, number]) {
    if (Array.isArray(int)) {
      return this.atoms.slice(int[0], int[1]);
    }
    return this.atoms[int];
  }

  toString(): string {
    return this.nodes.map((el) => el.toString()).join("");
  }

  printNodes() {
    return this.nodes.map((el) => el.print()).join(", ");
  }

  print(): string {
    let text = `BigSMILES: ${this.toString()}`;
    text += treeToStringLoop(this.nodes, []);
    return text;
  }
}
