import { CmdlToken } from "../../composite-tree-visitor";
import { InvalidPropertyError } from "../../errors";
import { Property, Group } from "./base-components";
import { AstVisitor, SymbolTableBuilder } from "../../symbols";
import { SymbolReference } from "./reference-group";
import { ModelVisitor } from "../../symbols";
import { BaseError } from "../../errors";

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

  /**
   * Sets value and token for reference property
   * @param token CmdlToken
   */
  public setValue(token: CmdlToken): void {
    this.value = token.image;
    this.valueToken = token;
  }

  /**
   * Sets path for reference property
   * @param tokens CmdlToken[]
   */
  public setPath(tokens: CmdlToken[]): void {
    this.path = tokens;
  }

  public async doValidation(): Promise<BaseError[]> {
    this.getPropertyType();
    this.validateProperty();
    this.validateRef();

    return this.errors;
  }

  /**
   * Validates reference property
   */
  private validateRef(): void {
    if (!this.value || !this.valueToken) {
      let msg = `${this.name} is missing a value!`;
      let err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
    }
  }

  /**
   * Gets the path of the reference property
   * @returns string[]
   */
  public getPath(): string[] {
    return this.path.map((el) => el.image);
  }

  /**
   * Gets the value of the reference property
   * @returns string
   */
  public getValues(): string {
    return this.value;
  }

  public print(): Record<string, any> {
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

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitRefProp(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitReferenceProperty(this);
    }
  }
}
