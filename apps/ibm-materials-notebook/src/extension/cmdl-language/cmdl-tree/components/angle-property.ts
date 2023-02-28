import { CmdlToken } from "../../composite-tree-visitor";
import { Property } from "./base-components";
import { ReferenceValue } from "./reference-list-property";
import {
  AstVisitor,
  ModelVisitor,
  SymbolTableBuilder,
} from "../../cmdl-symbols";

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

  setValue(token: CmdlToken) {
    this.value = token.image;
    this.valueToken = token;
  }

  setCurrentSide(string: "lhs" | "rhs") {
    this.currentSide = string;
  }

  addReference(name: CmdlToken, path: CmdlToken[] = []) {
    const refValue = new ReferenceValue(name, path);

    if (this.currentSide === "lhs") {
      this.lhs.push(refValue);
    } else {
      this.rhs.push(refValue);
    }
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();

    return this.errors;
  }

  print() {
    return {
      name: this.name,
      value: this.value,
      lhs: this.lhs.map((el) => el.print()),
      rhs: this.rhs.map((el) => el.print()),
    };
  }

  getSources() {
    return this.lhs;
  }

  getTargets() {
    return this.rhs;
  }

  getValues() {
    return this.value;
  }

  export() {
    return {
      sources: this.lhs.map((el) => el.export()),
      targets: this.rhs.map((el) => el.export()),
      quantity: this.value,
    };
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitAngleProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitAngleProperty(this);
    }
  }
}
