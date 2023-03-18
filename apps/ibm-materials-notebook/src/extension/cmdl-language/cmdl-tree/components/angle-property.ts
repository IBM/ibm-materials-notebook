import { CmdlToken } from "../../composite-tree-visitor";
import { Property } from "./base-components";
import { ReferenceValue } from "./reference-list-property";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";
import { BaseError } from "../../errors";

/**
 * Handles angle properties in polymer graph definitions
 */
export class AngleProperty extends Property {
  protected lhs: ReferenceValue[] = [];
  protected rhs: ReferenceValue[] = [];
  protected value: string = "1";
  protected valueToken?: CmdlToken;
  protected currentSide: "lhs" | "rhs" = "lhs";

  constructor(lAngle: CmdlToken, rAngle: CmdlToken) {
    super({
      image: "connections",
      startLine: lAngle.startLine,
      startOffset: lAngle.startOffset,
      endLine: lAngle.endLine,
      endOffset: rAngle.endOffset,
      type: "connections",
    });
  }

  /**
   * Sets value and token properties on AngleProperty
   * @param token CmdlToken
   */
  public setValue(token: CmdlToken): void {
    this.value = token.image;
    this.valueToken = token;
  }

  /**
   * Sets the current side of the AngleProperty expression.
   * @param string "lhs" | "rhs"
   */
  public setCurrentSide(string: "lhs" | "rhs"): void {
    this.currentSide = string;
  }

  /**
   * Adds a reference value for an element on a given side of the angle expression.
   * @param name CmdlToken
   * @param path CmdlToken[]
   */
  public addReference(name: CmdlToken, path: CmdlToken[] = []): void {
    const refValue = new ReferenceValue(name, path);

    if (this.currentSide === "lhs") {
      this.lhs.push(refValue);
    } else {
      this.rhs.push(refValue);
    }
  }

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();

    return this.errors;
  }

  public print(): Record<string, any> {
    return {
      name: this.name,
      value: this.value,
      lhs: this.lhs.map((el) => el.print()),
      rhs: this.rhs.map((el) => el.print()),
    };
  }

  /**
   * Returns sources for a particular edge within the polymer graph.
   * Sources are on the lhs of the angle property expression
   * @returns ReferenceValue[]
   */
  public getSources(): ReferenceValue[] {
    return this.lhs;
  }

  /**
   * Returns targets for a particular edge within the polymer graph.
   * Targets are on the rhs of the angle property expression
   * @returns ReferencValue[]
   */
  public getTargets() {
    return this.rhs;
  }

  public getValues(): string {
    return this.value;
  }

  /**
   * Exports AngleProperty to for further processing
   * @TODO improve typing for export
   * @returns
   */
  public export() {
    return {
      sources: this.lhs.map((el) => el.export()),
      targets: this.rhs.map((el) => el.export()),
      quantity: this.value,
    };
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitAngleProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitAngleProperty(this);
    }
  }
}
