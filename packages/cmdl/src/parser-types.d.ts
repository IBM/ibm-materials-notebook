import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface DocumentCstNode extends CstNode {
  name: "document";
  children: DocumentCstChildren;
}

export type DocumentCstChildren = {
  importStatement?: ImportStatementCstNode[];
  collectionDeclaration?: CollectionDeclarationCstNode[];
  recordDeclaration?: RecordDeclarationCstNode[];
  graphDeclaration?: GraphDeclarationCstNode[];
  assignmentProperty?: AssignmentPropertyCstNode[];
};

export interface AssignmentPropertyCstNode extends CstNode {
  name: "assignmentProperty";
  children: AssignmentPropertyCstChildren;
}

export type AssignmentPropertyCstChildren = {
  PROPERTY: IToken[];
  PROP_NAME: IToken[];
  COLON: IToken[];
  TYPE: IToken[];
  ASSIGNMENT: IToken[];
  STRING_LITERAL: IToken[];
  SEMICOLON: IToken[];
};

export interface CollectionDeclarationCstNode extends CstNode {
  name: "collectionDeclaration";
  children: CollectionDeclarationCstChildren;
}

export type CollectionDeclarationCstChildren = {
  COLLECTION: IToken[];
  COLLECTION_NAME: IToken[];
  assignmentProperty?: AssignmentPropertyCstNode[];
  recordDeclaration?: RecordDeclarationCstNode[];
  graphDeclaration?: GraphDeclarationCstNode[];
  collectionDeclaration?: CollectionDeclarationCstNode[];
  END: IToken[];
  END_COLLECTION_NAME: IToken[];
};

export interface ImportStatementCstNode extends CstNode {
  name: "importStatement";
  children: ImportStatementCstChildren;
}

export type ImportStatementCstChildren = {
  IMPORT: IToken[];
  IMPORT_NAME: IToken[];
  IMPORT_ALIAS?: AliasClauseCstNode[];
  FROM: IToken[];
  IMPORT_SOURCE: IToken[];
  SEMICOLON: IToken[];
};

export interface AliasClauseCstNode extends CstNode {
  name: "aliasClause";
  children: AliasClauseCstChildren;
}

export type AliasClauseCstChildren = {
  AS: IToken[];
  IDENTIFIER: IToken[];
};

export interface RecordDeclarationCstNode extends CstNode {
  name: "recordDeclaration";
  children: RecordDeclarationCstChildren;
}

export type RecordDeclarationCstChildren = {
  RECORD: IToken[];
  RECORD_NAME: IToken[];
  COLON: IToken[];
  TYPE: IToken[];
  LCURL: IToken[];
  propertyItem?: PropertyItemCstNode[];
  referenceDeclaration?: ReferenceDeclarationCstNode[];
  SEMICOLON?: IToken[];
  RCURL: IToken[];
};

export interface GraphDeclarationCstNode extends CstNode {
  name: "graphDeclaration";
  children: GraphDeclarationCstChildren;
}

export type GraphDeclarationCstChildren = {
  GRAPH: IToken[];
  GRAPH_NAME: IToken[];
  COLON: IToken[];
  TYPE: IToken[];
  LCURL: IToken[];
  arrowProperty?: ArrowPropertyCstNode[];
  propertyItem?: PropertyItemCstNode[];
  SEMICOLON?: IToken[];
  RCURL: IToken[];
};

export interface ReferenceDeclarationCstNode extends CstNode {
  name: "referenceDeclaration";
  children: ReferenceDeclarationCstChildren;
}

export type ReferenceDeclarationCstChildren = {
  REFERENCE_NAME: IToken[];
  DOT?: IToken[];
  REF_ITEM?: IToken[];
  LCURL: IToken[];
  propertyItem?: PropertyItemCstNode[];
  SEMICOLON?: IToken[];
  RCURL: IToken[];
};

export interface ArrowPropertyCstNode extends CstNode {
  name: "arrowProperty";
  children: ArrowPropertyCstChildren;
}

export type ArrowPropertyCstChildren = {
  LANGLE: IToken[];
  lhs: ReferencePipeCstNode[];
  ARROW: IToken[];
  rhs: ReferencePipeCstNode[];
  RANGLE: IToken[];
  COLON?: IToken[];
  EDGE_VALUE?: IToken[];
};

export interface ReferencePipeCstNode extends CstNode {
  name: "referencePipe";
  children: ReferencePipeCstChildren;
}

export type ReferencePipeCstChildren = {
  referenceValue: (ReferenceValueCstNode)[];
  PIPE?: IToken[];
};

export interface PropertyItemCstNode extends CstNode {
  name: "propertyItem";
  children: PropertyItemCstChildren;
}

export type PropertyItemCstChildren = {
  PROP_NAME: IToken[];
  COLON: IToken[];
  BOOLEAN_VALUE?: (IToken)[];
  STR_VALUE?: IToken[];
  numericalValue?: NumericalValueCstNode[];
  referenceValue?: ReferenceValueCstNode[];
  list?: ListCstNode[];
  refList?: RefListCstNode[];
};

export interface ReferenceValueCstNode extends CstNode {
  name: "referenceValue";
  children: ReferenceValueCstChildren;
}

export type ReferenceValueCstChildren = {
  REFERENCE_NAME: IToken[];
  DOT?: IToken[];
  REF_ITEM?: IToken[];
};

export interface ListCstNode extends CstNode {
  name: "list";
  children: ListCstChildren;
}

export type ListCstChildren = {
  LSQUARE: IToken[];
  STR_VALUE: (IToken)[];
  COMMA?: IToken[];
  RSQUARE: IToken[];
};

export interface RefListCstNode extends CstNode {
  name: "refList";
  children: RefListCstChildren;
}

export type RefListCstChildren = {
  LSQUARE: IToken[];
  referenceValue?: ReferenceValueCstNode[];
  COMMA?: IToken[];
  RSQUARE: IToken[];
};

export interface NumericalValueCstNode extends CstNode {
  name: "numericalValue";
  children: NumericalValueCstChildren;
}

export type NumericalValueCstChildren = {
  NUMBER_LITERAL: IToken[];
  UNCERTAINTY_OPERATOR?: IToken[];
  UNC_VALUE?: IToken[];
  NUM_UNIT?: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  document(children: DocumentCstChildren, param?: IN): OUT;
  assignmentProperty(children: AssignmentPropertyCstChildren, param?: IN): OUT;
  collectionDeclaration(children: CollectionDeclarationCstChildren, param?: IN): OUT;
  importStatement(children: ImportStatementCstChildren, param?: IN): OUT;
  aliasClause(children: AliasClauseCstChildren, param?: IN): OUT;
  recordDeclaration(children: RecordDeclarationCstChildren, param?: IN): OUT;
  graphDeclaration(children: GraphDeclarationCstChildren, param?: IN): OUT;
  referenceDeclaration(children: ReferenceDeclarationCstChildren, param?: IN): OUT;
  arrowProperty(children: ArrowPropertyCstChildren, param?: IN): OUT;
  referencePipe(children: ReferencePipeCstChildren, param?: IN): OUT;
  propertyItem(children: PropertyItemCstChildren, param?: IN): OUT;
  referenceValue(children: ReferenceValueCstChildren, param?: IN): OUT;
  list(children: ListCstChildren, param?: IN): OUT;
  refList(children: RefListCstChildren, param?: IN): OUT;
  numericalValue(children: NumericalValueCstChildren, param?: IN): OUT;
}
