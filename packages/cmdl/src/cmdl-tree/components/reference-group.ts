import { CmdlToken } from "../../composite-tree-visitor";
import { BaseError, InvalidGroupError } from "../../errors";
import { Group, Property, RecordNode } from "./base-components";
import { IGroup } from "../../cmdl-types/groups";
import { CmdlTree } from "../cmdl-tree";
import { GeneralGroup } from "./general-group";
import { AstVisitor, SymbolTableBuilder } from "../../symbols";
import { ModelVisitor } from "../../symbols";

export interface SymbolReference extends RecordNode {
  path: CmdlToken[];
  getPath(): string[];
}

/**
 * Component for handling references to defined or imported components (chemicals, materials, etc.) and
 * new properties defined for them. Validates nested properites for parent group reference.
 *
 */
export class ReferenceGroup extends Group implements SymbolReference {
  path: CmdlToken[] = [];
  parentGroupProps?: IGroup;

  constructor(token: CmdlToken, pathTokens: CmdlToken[] = []) {
    super(token);
    this.path = pathTokens;
    this.checkNesting = this.checkNesting.bind(this);
  }

  /**
   * Sets parent group types to enable proper validation of child properties enclosed by reference group.
   * Creates an error if the reference group is improperly placed in record or parent group types does not exist.
   * @returns
   */
  private setParentGroupProps(): void {
    if (!this.parent || this.parent instanceof CmdlTree) {
      const msg = `Reference groups must have an enclosing group: ${this.name}`;
      const err = new InvalidGroupError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    const groupProps = this.typeManager.getGroup(this.parent.name);

    if (!groupProps) {
      let msg = `${this.name} is not a recognized group`;
      let err = new InvalidGroupError(msg, this.nameToken);
      this.errors.push(err);
    } else {
      this.parentGroupProps = groupProps;
    }
  }

  /**
   * Validates reference group children, creates errors if invalid child nodes identified.
   * @param child RecordNode
   * @param props Set<string>
   */
  private checkNesting(child: RecordNode, props: Set<string>): void {
    let msg: string;
    let err: BaseError;

    if (
      (child instanceof GeneralGroup ||
        child instanceof ReferenceGroup ||
        child instanceof Property) &&
      props.has(child.name)
    ) {
      this.createDuplicationErr(child);
    } else if (child instanceof ReferenceGroup) {
      const path = child.getPath().join(".");
      const pathStr = path.length ? `.${path}` : "";
      const fullName = `${child.name}${pathStr}`;
      props.add(fullName);
    } else {
      props.add(child.name);
    }

    if (child instanceof ReferenceGroup) {
      msg = `Reference groups may not be nested: ${child.name}`;
      err = new InvalidGroupError(msg, this.nameToken);
      this.errors.push(err);
    }

    if (this.parentGroupProps && child instanceof Property) {
      if (!this.parentGroupProps.referenceProps.includes(child.name)) {
        msg = `${child.name} is not a valid property on ${this.name} within ${this.parent?.name}`;
        err = new InvalidGroupError(msg, this.nameToken);
        this.errors.push(err);
      }
    }
  }

  /**
   * Gets reference path for reference group
   * @returns string[]
   */
  public getPath(): string[] {
    return this.path.map((el) => el.image);
  }

  /**
   * Calls relevant visitor methods for building symbol table
   * @param visitor AstVisitor
   */
  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitReference(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitReferenceGroup(this);
    }
  }

  /**
   * Calls validation procedure for reference group
   * @returns BaseError[]
   */
  public async doValidation(): Promise<BaseError[]> {
    this.setParentGroupProps();
    await this.validateChildren(this.checkNesting);
    return this.errors;
  }
}
