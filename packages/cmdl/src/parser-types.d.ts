import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface RecordCstNode extends CstNode {
  name: "record";
  children: RecordCstChildren;
}

export type RecordCstChildren = {
  statement?: StatementCstNode[];
};

export interface StatementCstNode extends CstNode {
  name: "statement";
  children: StatementCstChildren;
}

export type StatementCstChildren = {
  importFileStatement?: ImportFileStatementCstNode[];
  importStatement?: ImportStatementCstNode[];
  groupDeclaration?: GroupDeclarationCstNode[];
};

export interface ImportStatementCstNode extends CstNode {
  name: "importStatement";
  children: ImportStatementCstChildren;
}

export type ImportStatementCstChildren = {
  Import: IToken[];
  Identifier: IToken[];
  alias?: AliasClauseCstNode[];
  From: IToken[];
  StringLiteral: IToken[];
  Semicolon: IToken[];
};

export interface ImportFileStatementCstNode extends CstNode {
  name: "importFileStatement";
  children: ImportFileStatementCstChildren;
}

export type ImportFileStatementCstChildren = {
  Import: IToken[];
  Star: IToken[];
  As: IToken[];
  Identifier: IToken[];
  From: IToken[];
  StringLiteral: IToken[];
  Semicolon: IToken[];
};

export interface AliasClauseCstNode extends CstNode {
  name: "aliasClause";
  children: AliasClauseCstChildren;
}

export type AliasClauseCstChildren = {
  As: IToken[];
  Identifier: IToken[];
};

export interface GroupDeclarationCstNode extends CstNode {
  name: "groupDeclaration";
  children: GroupDeclarationCstChildren;
}

export type GroupDeclarationCstChildren = {
  namedGroup?: NamedGroupCstNode[];
  variableGroup?: VariableGroupCstNode[];
  referenceDeclaration?: ReferenceDeclarationCstNode[];
  Identifier?: IToken[];
  group: GroupCstNode[];
};

export interface NamedGroupCstNode extends CstNode {
  name: "namedGroup";
  children: NamedGroupCstChildren;
}

export type NamedGroupCstChildren = {
  Keyword: IToken[];
  Identifier: IToken[];
};

export interface VariableGroupCstNode extends CstNode {
  name: "variableGroup";
  children: VariableGroupCstChildren;
}

export type VariableGroupCstChildren = {
  Keyword: IToken[];
  Variable: IToken[];
};

export interface ReferenceDeclarationCstNode extends CstNode {
  name: "referenceDeclaration";
  children: ReferenceDeclarationCstChildren;
}

export type ReferenceDeclarationCstChildren = {
  Link: IToken[];
  Dot?: IToken[];
  Identifier?: IToken[];
};

export interface GroupCstNode extends CstNode {
  name: "group";
  children: GroupCstChildren;
}

export type GroupCstChildren = {
  LCurly: IToken[];
  groupItem?: GroupItemCstNode[];
  Semicolon?: IToken[];
  RCurly: IToken[];
};

export interface GroupItemCstNode extends CstNode {
  name: "groupItem";
  children: GroupItemCstChildren;
}

export type GroupItemCstChildren = {
  arrowProperty?: ArrowPropertyCstNode[];
  propertyItem?: PropertyItemCstNode[];
  groupDeclaration?: GroupDeclarationCstNode[];
};

export interface ArrowPropertyCstNode extends CstNode {
  name: "arrowProperty";
  children: ArrowPropertyCstChildren;
}

export type ArrowPropertyCstChildren = {
  LAngle: IToken[];
  lhs: ReferencePipeCstNode[];
  Arrow: IToken[];
  rhs: ReferencePipeCstNode[];
  RAngle: IToken[];
  Colon?: IToken[];
  NumberLiteral?: IToken[];
};

export interface ReferencePipeCstNode extends CstNode {
  name: "referencePipe";
  children: ReferencePipeCstChildren;
}

export type ReferencePipeCstChildren = {
  referenceDeclaration: (ReferenceDeclarationCstNode)[];
  Pipe?: IToken[];
};

export interface PropertyItemCstNode extends CstNode {
  name: "propertyItem";
  children: PropertyItemCstChildren;
}

export type PropertyItemCstChildren = {
  Identifier: IToken[];
  Colon: IToken[];
  value: ValueCstNode[];
};

export interface ValueCstNode extends CstNode {
  name: "value";
  children: ValueCstChildren;
}

export type ValueCstChildren = {
  True?: IToken[];
  False?: IToken[];
  StringLiteral?: IToken[];
  Variable?: IToken[];
  numericalValue?: NumericalValueCstNode[];
  referenceDeclaration?: ReferenceDeclarationCstNode[];
  list?: ListCstNode[];
  refList?: RefListCstNode[];
};

export interface ListCstNode extends CstNode {
  name: "list";
  children: ListCstChildren;
}

export type ListCstChildren = {
  LSquare: IToken[];
  StringLiteral: (IToken)[];
  Comma?: IToken[];
  RSquare: IToken[];
};

export interface RefListCstNode extends CstNode {
  name: "refList";
  children: RefListCstChildren;
}

export type RefListCstChildren = {
  LSquare: IToken[];
  referenceDeclaration?: ReferenceDeclarationCstNode[];
  Comma?: IToken[];
  RSquare: IToken[];
};

export interface NumericalValueCstNode extends CstNode {
  name: "numericalValue";
  children: NumericalValueCstChildren;
}

export type NumericalValueCstChildren = {
  value: IToken[];
  uncertainty?: UncertaintyExpressionCstNode[];
  unit?: IToken[];
};

export interface UncertaintyExpressionCstNode extends CstNode {
  name: "uncertaintyExpression";
  children: UncertaintyExpressionCstChildren;
}

export type UncertaintyExpressionCstChildren = {
  UncertaintyOperator: IToken[];
  NumberLiteral: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  record(children: RecordCstChildren, param?: IN): OUT;
  statement(children: StatementCstChildren, param?: IN): OUT;
  importStatement(children: ImportStatementCstChildren, param?: IN): OUT;
  importFileStatement(children: ImportFileStatementCstChildren, param?: IN): OUT;
  aliasClause(children: AliasClauseCstChildren, param?: IN): OUT;
  groupDeclaration(children: GroupDeclarationCstChildren, param?: IN): OUT;
  namedGroup(children: NamedGroupCstChildren, param?: IN): OUT;
  variableGroup(children: VariableGroupCstChildren, param?: IN): OUT;
  referenceDeclaration(children: ReferenceDeclarationCstChildren, param?: IN): OUT;
  group(children: GroupCstChildren, param?: IN): OUT;
  groupItem(children: GroupItemCstChildren, param?: IN): OUT;
  arrowProperty(children: ArrowPropertyCstChildren, param?: IN): OUT;
  referencePipe(children: ReferencePipeCstChildren, param?: IN): OUT;
  propertyItem(children: PropertyItemCstChildren, param?: IN): OUT;
  value(children: ValueCstChildren, param?: IN): OUT;
  list(children: ListCstChildren, param?: IN): OUT;
  refList(children: RefListCstChildren, param?: IN): OUT;
  numericalValue(children: NumericalValueCstChildren, param?: IN): OUT;
  uncertaintyExpression(children: UncertaintyExpressionCstChildren, param?: IN): OUT;
}
