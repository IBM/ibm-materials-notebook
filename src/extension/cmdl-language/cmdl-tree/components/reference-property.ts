import { CmdlToken } from "../../composite-tree-visitor";
import { InvalidPropertyError } from "../../errors";
import { Property, Group } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../../cmdl-symbols";
import { SymbolReference } from "./reference-group";
import { ModelVisitor } from "../../cmdl-symbols";

/**
 * Handles reference properties within CMDL record trees
 */
export class RefProperty extends Property implements SymbolReference {
  protected value: string = "";
  protected valueToken?: CmdlToken;
  path: CmdlToken[] = [];

  constructor(token: CmdlToken) {
    super(token);
  }

  setValue(token: CmdlToken) {
    this.value = token.image;
    this.valueToken = token;
  }

  setPath(tokens: CmdlToken[]) {
    this.path = tokens;
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();
    this.validateRef();

    return this.errors;
  }

  private validateRef() {
    if (!this.value || !this.valueToken) {
      let msg = `${this.name} is missing a value!`;
      let err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
    }
  }

  public getPath() {
    return this.path.map((el) => el.image);
  }

  public getValues() {
    return this.value;
  }

  public print(): any {
    let parentName = null;

    if (this.parent && this.parent instanceof Group) {
      parentName = this.parent.name;
    }

    return {
      name: this.name,
      value: this.value,
      parent: parentName,
    };
  }

  accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitRefProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitReferenceProperty(this);
    }
  }
}
