import { Config } from "../config";
import { AstComponent } from "../bigsmiles";
import { Bond } from "./bond";
import { logger } from "../logger";

enum AtomChirality {
  none = "",
  R = "@",
  S = "@@",
}

/**
 * Class for representing atoms within a BigSMILES string
 *
 */
export class Atom implements AstComponent {
  id_: number;
  symbol: string;
  valence_possible: number[];
  valence: number | null;
  chiral: AtomChirality;
  charge: number;
  isotope: number | null;
  _hydrogens: number | null;
  organic: boolean;
  bonds: Bond[] = [];
  _tree_print_repr = true;

  constructor(symbol: string, id_: number) {
    const [processedSymbol, chirality, charge, isotope, hydrogens] =
      this.processAtomSymbol(symbol);
    const valence_possible = this.checkValence(processedSymbol);
    this.id_ = id_;
    this.symbol = processedSymbol;
    this.chiral = chirality;
    this.charge = charge;
    this.isotope = isotope;
    this._hydrogens = hydrogens;
    this.valence_possible = valence_possible ? valence_possible : [];
    this.valence =
      valence_possible && valence_possible.length ? valence_possible[0] : null;
    this.organic = this.symbol in Config.organics ? true : false;
  }

  get possibleValence(): number | null {
    if (!this.valence_possible) {
      return null;
    }
    return this.valence_possible[this.valence_possible.length - 1];
  }

  get bondsAvailable(): number | null {
    if (!this.valence) {
      return null;
    }
    return this.valence - this.numberOfBonds;
  }

  get numberOfBonds(): number {
    let hydrogenCount = 0;

    if (this._hydrogens) {
      hydrogenCount = this._hydrogens;
    }

    const bondValue: number = this.bonds
      .map((el) => el.type_)
      .reduce((acc, curr) => (acc += curr), 0);

    return bondValue + hydrogenCount;
  }

  get ringIndexes(): number[] {
    let ringIndex: number[] = [];

    for (const bond of this.bonds) {
      if (bond.ring_id) {
        ringIndex.push(bond.ring_id);
      }
    }
    return ringIndex;
  }

  private processAtomSymbol(
    symbolText: string
  ): [string, AtomChirality, number, number | null, number | null] {
    const bracket_regex = new RegExp(/\[|\]/g);

    if (bracket_regex.test(symbolText)) {
      let trimmedSymbol = symbolText.replaceAll(bracket_regex, "");
      let [isoSymbol, isotope] = this.getIsotope(trimmedSymbol);
      let [chiralSymbol, chirality] = this.getChirality(isoSymbol);
      let [hydroSymbol, hydrogens] = this.getHydrogens(chiralSymbol);
      let [chargeSymbol, charge] = this.getCharge(hydroSymbol);

      return [chargeSymbol, chirality, charge, isotope, hydrogens];
    } else {
      return [symbolText, AtomChirality.none, 0, null, null];
    }
  }

  private getCharge(symbolText: string): [string, number] {
    const chargeRegex = new RegExp(
      /(?<chargeSymbol>[-|\+]{1,3})(?<chargeNumber>[\d]?)/
    );
    const match = symbolText.match(chargeRegex);
    if (!match || !match?.groups) {
      return [symbolText, 0];
    }

    let newSymbol = symbolText.replace(chargeRegex, "");
    let chargeValue: number;

    if (!match.groups?.chargeNumber) {
      chargeValue =
        match.groups.chargeSymbol[0] === "-"
          ? -1 * match.groups.chargeSymbol.length
          : match.groups.chargeSymbol.length;
    } else {
      let numberValue = parseInt(match.groups.chargeNumber);
      chargeValue =
        match.groups.chargeSymbol[0] === "-" ? -1 * numberValue : numberValue;
    }

    return [newSymbol, chargeValue];
  }

  private getChirality(symbolText: string): [string, AtomChirality] {
    const chirality_regex = new RegExp(/@{1,2}/);
    let result = chirality_regex.test(symbolText);

    if (!result) {
      return [symbolText, AtomChirality.none];
    }

    const match = symbolText.match(chirality_regex);
    const updatedSymbol = symbolText.replace(chirality_regex, "");

    if (match && match[0] === AtomChirality.R) {
      return [updatedSymbol, AtomChirality.R];
    } else {
      return [updatedSymbol, AtomChirality.S];
    }
  }

  private getIsotope(symbolText: string): [string, number | null] {
    const isotope_regex = new RegExp(/^\d+/);
    const isotope_test = isotope_regex.test(symbolText);
    const isotope_match = symbolText.match(isotope_regex);

    if (!isotope_test || !isotope_match) {
      return [symbolText, null];
    }

    const updatedSymbol = symbolText.replace(isotope_match[0], "");
    const isotope_value = Number(isotope_match[0]);

    return [updatedSymbol, isotope_value];
  }

  private getHydrogens(symbolText: string): [string, number | null] {
    const hydrogen_regex = new RegExp(/H\d?/);
    const result = symbolText.match(hydrogen_regex);

    if (!result) {
      return [symbolText, null];
    }
    const updatedSymbol = symbolText.replace(result[0], "");
    if (result[0].length === 1) {
      return [updatedSymbol, 1];
    }

    const count = Number(result[0].slice(-1));
    return [updatedSymbol, count];
  }

  private checkValence(processedSymbol: string): number[] | null {
    if (processedSymbol in Config.atoms_with_valence) {
      return Config.atoms_with_valence[processedSymbol].valence;
    } else {
      return null;
    }
  }

  public toString(showHydrogens: boolean = false) {
    let text = this.symbol;
    let bracketFlag = false;

    if (this.symbol === "H") {
      bracketFlag = true;
    }

    if (this.chiral !== AtomChirality.none) {
      text = `${text}${this.chiral}`;
      if (this.bondsAvailable === 1) {
        showHydrogens = true;
      }
      bracketFlag = true;
    }

    if ((showHydrogens && this.bondsAvailable) || this._hydrogens) {
      if (this._hydrogens) {
        text = `${text}H${this._hydrogens > 1 ? this._hydrogens : ""}`;
      } else {
        text = `${text}H${
          this.bondsAvailable && this.bondsAvailable > 1
            ? this.bondsAvailable
            : ""
        }`;
      }

      bracketFlag = true;
    }

    if (this.charge > 0) {
      text = `${text}+${this.charge > 1 ? this.charge : ""}`;
      bracketFlag = true;
    } else if (this.charge < 0) {
      text = `${text}${Math.abs(this.charge) > 1 ? this.charge : "-"}`;
      bracketFlag = true;
    }

    if (this.isotope) {
      text = `${this.isotope}${text}`;
      bracketFlag = true;
    }

    if (bracketFlag) {
      text = `[${text}]`;
    }

    const ringIndices = this.ringIndexes.join("");
    const finalText = `${text}${ringIndices}`;

    return finalText;
  }

  public print(): string {
    return `Atom: ${this.toString()}{${this.id_}}`;
  }
}
