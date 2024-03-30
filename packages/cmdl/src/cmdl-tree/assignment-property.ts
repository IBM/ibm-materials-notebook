import { CmdlToken } from "../cmdl-ast";
import { AstVisitor } from "../symbols";
import { Property } from "./base-components";
import { SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { parseStringImage } from "./utils";
import { CMDLError } from "../errors";

/**
 * @deprecated
 */
export class AssignmentProperty extends Property {
  protected value: string = "";

  constructor(nameToken: CmdlToken, valueToken: CmdlToken) {
    super(nameToken);
    this.value = parseStringImage(valueToken.image);
    this.valueToken = valueToken;
  }

  public doValidation(): CMDLError[] {
    this.validateProperty();
    return this.errors;
  }

  public getValues(): string {
    return this.value;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitAssignmentProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitAssignmentProp(this);
    }
  }
}
