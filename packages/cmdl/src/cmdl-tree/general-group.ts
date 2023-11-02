import { CmdlToken } from "../cmdl-ast";
import { BaseError, InvalidGroupError, InvalidPropertyError } from "../errors";
import { Group, Property, RecordNode } from "./base-components";
import { GROUPS, PROPERTIES } from "../cmdl-types";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { AssignmentProperty } from "./assignment-property";

/**
 * Handles general, unnamed groups in CMDL record trees
 */
export class GeneralGroup extends Group {
  constructor(token: CmdlToken) {
    super(token);
    this.validateGroupChild = this.validateGroupChild.bind(this);
  }

  /**
   * Performs validation on Group name.
   * @returns void
   */
  protected validateGroupName(): void {
    if (!this.groupProps) {
      return;
    }

    if (this.name !== GROUPS.META && this.name !== GROUPS.FRAGMENTS) {
      const msg = `${this.name} is a named group and is missing an identifier`;
      const err = new InvalidGroupError(msg, this.nameToken);
      this.errors.push(err);
    }
  }

  /**
   * Performs validation on a child node of the group
   * @param child RecordNode
   * @param props Set<string>
   * @returns void
   */
  protected validateGroupChild(child: RecordNode): void {
    if (!this.groupProps) {
      return;
    }

    let msg: string;
    let err: BaseError;

    if (child instanceof AssignmentProperty) {
      if (!this.groupProps.properties.includes(PROPERTIES.FRAGMENT)) {
        msg = `${child.name} is not a valid sub-group of ${this.name}`;
        err = new InvalidGroupError(msg, child.nameToken);
        this.errors.push(err);
        return;
      } else {
        return;
      }
    }

    if (
      child instanceof GeneralGroup &&
      !this.groupProps.subGroups.includes(child.name)
    ) {
      msg = `${child.name} is not a valid sub-group of ${this.name}`;
      err = new InvalidGroupError(msg, child.nameToken);
      this.errors.push(err);
    }

    if (
      child instanceof Property &&
      !this.groupProps.properties.includes(child.name)
    ) {
      msg = `${child.name} is not a valid property on ${this.name}`;
      err = new InvalidPropertyError(msg, child.nameToken);
      this.errors.push(err);
    }
  }

  public doValidation(): BaseError[] {
    this.setGroupProps();
    this.validateGroupName();
    this.validateChildren(this.validateGroupChild);
    return this.errors;
  }

  /**
   * Retrieves array of children for current group
   * @deprecated
   * @returns RecordNode[]
   */
  public getSymbolRefs(): RecordNode[] {
    const symbolArr = [];
    for (const child of this.children) {
      symbolArr.push(child);
    }

    return symbolArr;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitGroup(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitGeneralGroup(this);
    }
  }
}
