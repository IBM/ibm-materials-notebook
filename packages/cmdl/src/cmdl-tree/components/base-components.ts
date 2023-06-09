import { typeManager } from "../../cmdl-types";
import { CmdlToken } from "../../composite-tree-visitor";
import {
  BaseError,
  DuplicationError,
  InvalidGroupError,
  InvalidPropertyError,
  MissingValueError,
} from "../../errors";
import { IGroup } from "../../cmdl-types/groups";
import { IProperty } from "../../cmdl-types/properties";
import { CmdlTree } from "../cmdl-tree";
import { AstVisitor } from "../../symbols";
import { ReferenceValue } from "./reference-list-property";
import { Library } from "../../../library";

/**
 * Interface for a record node in the CMDL component AST
 */
export interface RecordNode {
  name: string;
  nameToken: CmdlToken;
  parent: RecordNode | CmdlTree | null;
  errors: BaseError[];

  /**
   * Perform validation logic on record node
   * @param library Library
   */
  doValidation(library?: Library): Promise<BaseError[]>;
  /**
   * Set parent node of current node
   * @param arg RecordNode | CMDLTree
   */
  setParent(arg: RecordNode | CmdlTree): void;
  /**
   * Accept a visitor to current record node in AST
   * @param visitor AstVisitor
   */
  accept(visitor: AstVisitor): void;
  /**
   * Convert node to object for printing to console
   */
  print(): Record<string, any>;
}

export abstract class Group implements RecordNode {
  name: string;
  nameToken: CmdlToken;
  parent: RecordNode | CmdlTree | null = null;
  errors: BaseError[] = [];
  protected readonly typeManager = typeManager;
  children: RecordNode[] = [];
  protected groupProps?: IGroup;

  constructor(token: CmdlToken) {
    this.name = token.image;
    this.nameToken = token;
  }

  /**
   * Addes a node to a Group component
   * @param component RecordNode
   */
  public add(component: RecordNode): void {
    this.children.push(component);
    component.setParent(this);
  }

  public setParent(arg: RecordNode | CmdlTree): void {
    this.parent = arg;
  }

  /**
   * Sets the allowed property types on the group for validation purposes
   */
  protected setGroupProps(): void {
    const groupProps = this.typeManager.getGroup(this.name);

    if (!groupProps) {
      let msg = `${this.name} is not a recognized group`;
      let err = new InvalidGroupError(msg, this.nameToken);
      this.errors.push(err);
    } else {
      this.groupProps = groupProps;
    }
  }

  /**
   * Validates all current children of current node. Allows injection of custom validation logic.
   * @param injectValidation (child: RecordNode, props: Set<string>) => void
   */
  protected async validateChildren(
    injectValidation?: (child: RecordNode, props: Set<string>) => void
  ): Promise<void> {
    const properties = new Set<string>();

    for (const child of this.children) {
      let childErrors = await child.doValidation();
      this.errors = this.errors.concat(childErrors);

      if (injectValidation) {
        injectValidation(child, properties);
      }
    }
  }

  /**
   * Creates a DuplicationError if child node already exists on the group
   * @param child RecordNode
   * @param id string
   */
  protected createDuplicationErr(child: RecordNode, id?: string): void {
    let msg = `${child.name} ${id ? id : ""} already exists on ${this.name}`;
    let err = new DuplicationError(msg, child.nameToken);
    this.errors.push(err);
  }

  public async doValidation() {
    return this.errors;
  }

  public print(): Record<string, any> {
    let parentName = null;

    if (this.parent && this.parent instanceof Group) {
      parentName = this.parent.name;
    }

    const children = this.children.map((el) => el.print());
    return {
      name: this.name,
      parent: parentName,
      children,
    };
  }

  abstract accept(visitor: AstVisitor): void;
}

/**
 * Base class for properties in CMDL RecordTrees
 */
export abstract class Property implements RecordNode {
  name: string;
  nameToken: CmdlToken;
  parent: RecordNode | CmdlTree | null = null;
  errors: BaseError[] = [];
  protected readonly typeManager = typeManager;
  protected value: string[] | string | boolean | ReferenceValue[] | null = null;
  protected valueToken?: CmdlToken | CmdlToken[];
  protected propertyType?: IProperty;

  constructor(nameToken: CmdlToken) {
    this.name = nameToken.image;
    this.nameToken = nameToken;
  }

  public setParent(arg: RecordNode | CmdlTree): void {
    this.parent = arg;
  }

  /**
   * Retrieves property type information for the current node
   * @returns void
   */
  protected getPropertyType(): void {
    const propertyType = this.typeManager.getProperty(this.name);

    if (!propertyType) {
      let msg = `${this.name} is an unrecognized property`;
      let err = new InvalidPropertyError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }

    this.propertyType = propertyType;
  }

  /**
   * Validates current property value
   * @returns void
   */
  protected validateProperty(): void {
    if (!this.value) {
      let msg = `missing value for ${this.name}`;
      let err = new MissingValueError(msg, this.nameToken);
      this.errors.push(err);
      return;
    }
  }

  public async doValidation() {
    this.getPropertyType();
    this.validateProperty();
    return this.errors;
  }

  public print(): Record<
    string,
    string[] | string | boolean | ReferenceValue[] | null
  > {
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

  /**
   * Retrieves values for the current property
   * @returns unknown
   */
  abstract getValues(): unknown;
  abstract accept(visitor: AstVisitor): void;
}
