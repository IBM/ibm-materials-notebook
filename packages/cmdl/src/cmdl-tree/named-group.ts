import { CmdlToken } from "../cmdl-ast";
import { BaseError, InvalidGroupError, InvalidPropertyError } from "../errors";
import { Group, Property, RecordNode } from "./base-components";
import { GeneralGroup } from "./general-group";
import { ReferenceGroup } from "./reference-group";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";

/**
 * Handles named groups in the CMDL record trees
 * TODO: additional validation for char groups
 */
export class NamedGroup extends Group {
  public identifier: string;
  protected idToken: CmdlToken;

  constructor(token: CmdlToken, idToken: CmdlToken) {
    super(token);
    this.identifier = idToken.image;
    this.idToken = idToken;
    this.validateGroupChild = this.validateGroupChild.bind(this);
  }

  /**
   * Performs validation logic on all child nodes to current named group
   * @param child RecordNode
   * @param props Set<string>
   * @returns void
   */
  protected validateGroupChild(child: RecordNode, props: Set<string>): void {
    if (!this.groupProps) {
      return;
    }

    let msg: string;
    let err: BaseError;

    if (
      (child instanceof GeneralGroup || child instanceof Property) &&
      props.has(child.name)
    ) {
      if (child.name !== "connections") {
        this.createDuplicationErr(child);
      }
    } else if (child instanceof ReferenceGroup) {
      const path = child.getPath().join(".");
      const pathStr = path.length ? `.${path}` : "";
      const fullName = `${child.name}${pathStr}`;

      if (props.has(fullName)) {
        //! move duplication errors to symbol table only
        this.createDuplicationErr(child);
      } else {
        props.add(fullName);
      }
    } else {
      props.add(child.name);
    }

    if (
      child instanceof GeneralGroup &&
      !this.groupProps.subGroups.includes(child.name)
    ) {
      msg = `${child.name} is not a valid sub-group of ${this.name} ${this.identifier}`;
      err = new InvalidGroupError(msg, child.nameToken);
      this.errors.push(err);
    }

    if (
      child instanceof Property &&
      !this.groupProps.properties.includes(child.name)
    ) {
      msg = `${child.name} is not a valid property on ${this.name} ${this.identifier}`;
      err = new InvalidPropertyError(msg, child.nameToken);
      this.errors.push(err);
    }
  }

  public doValidation(): BaseError[] {
    this.setGroupProps();
    this.validateChildren(this.validateGroupChild);
    return this.errors;
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitNamedGroup(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitModelNode(this);
    }
  }
}
