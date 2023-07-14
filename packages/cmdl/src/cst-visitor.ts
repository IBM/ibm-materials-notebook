import { IToken } from "chevrotain";
import { CmdlAst, CmdlNode, CmdlToken } from "./cmdl-ast";
import { parserInstance } from "./parser";
import {
  GroupCstChildren,
  GroupDeclarationCstChildren,
  GroupItemCstChildren,
  ImportStatementCstChildren,
  NumericalValueCstChildren,
  PropertyItemCstChildren,
  StatementCstChildren,
  UncertaintyExpressionCstChildren,
  ValueCstChildren,
  ListCstChildren,
  RecordCstChildren,
  ReferenceDeclarationCstChildren,
  NamedGroupCstChildren,
  RefListCstChildren,
  ArrowPropertyCstChildren,
  ReferencePipeCstChildren,
  VariableGroupCstChildren,
  AliasClauseCstChildren,
  ImportFileStatementCstChildren,
} from "./parser-types";

export enum AstNodes {
  RECORD = "RECORD",
  IMPORT = "IMPORT",
  IMPORT_ID = "IMPORT_ID",
  AS = "AS",
  ALIAS = "ALIAS",
  ALIAS_ID = "ALIAS_ID",
  FROM = "FROM",
  LOCATION_ID = "LOCATION",
  REF_ID_PROP = "REF_ID_PROP",
  GROUP = "GROUP",
  REF_GROUP = "REF_GROUP",
  REF = "REF",
  PROP_DEC = "PROP_DEC",
  PROP_ID = "PROP_ID",
  PROP_VALUE = "PROP_VALUE",
  GROUP_ID = "GROUP_ID",
  GROUP_LCURL = "GROUP_LCURL",
  GROUP_RCURL = "GROUP_RCURL",
  PROP_LSQUARE = "PROP_LSQUARE",
  PROP_RSQUARE = "PROP_RSQUARE",
  PROP_LANGLE = "PROP_LANGLE",
  PROP_RANGLE = "PROP_RANGLE",
  PROP_ANGLE = "PROP_ANGLE",
  PROP_ANGLE_LHS = "PROP_ANGLE_LHS",
  PROP_ANGLE_ARROW = "PROP_ANGLE_ARROW",
  PROP_ANGLE_RHS = "PROP_ANGLE_RHS",
  IMPORT_STATEMENT = "IMPORT_STATEMENT",
  REF_VALUE = "REF_VALUE",
  STRING_VALUE = "STRING_VALUE",
  STAR = "STAR",
  BOOL_VALUE = "BOOL_VALUE",
  VALUE = "VALUE",
  UNIT = "UNIT",
  UNCERTAINTY = "UNCERTAINTY",
  VAR_VALUE = "VAR_VALUE",
}

const BaseVisitor = parserInstance.getBaseCstVisitorConstructor();

/**
 * Class to traverse CST generated by Chevrotain parser and compile an AST representation
 */
export class CstVisitor extends BaseVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  //return AST class
  record(ctx: RecordCstChildren, ast: CmdlAst): CmdlAst {
    const rootNode = new CmdlNode(AstNodes.RECORD);
    ast.root = rootNode;

    if (!ctx.statement) {
      return ast;
    }
    //for of loop
    for (const statement of ctx.statement) {
      this.visit(statement, rootNode);
    }

    return ast;
  }

  //Push any errors to AST class
  statement(ctx: StatementCstChildren, parent: CmdlNode) {
    if (ctx?.importFileStatement) {
      const importFileNode = new CmdlNode(AstNodes.IMPORT_STATEMENT);
      importFileNode.parent = parent;
      parent.add(importFileNode);
      this.visit(ctx.importFileStatement, importFileNode);
    } else if (ctx?.importStatement) {
      const importNode = new CmdlNode(AstNodes.IMPORT_STATEMENT);
      importNode.parent = parent;
      parent.add(importNode);
      this.visit(ctx.importStatement, importNode);
    } else if (ctx?.groupDeclaration) {
      this.visit(ctx.groupDeclaration, parent);
    } else {
      //? push errors to AST class?
      // throw new Error('Unhandled statement type');
    }
  }

  importFileStatement(ctx: ImportFileStatementCstChildren, parent: CmdlNode) {
    if (ctx?.Import && ctx.Import.length) {
      const importToken = this.extractToken(ctx.Import[0]);
      this.createAstNode(AstNodes.IMPORT, parent, importToken);
    }

    if (ctx?.Star && ctx.Star.length) {
      const starToken = this.extractToken(ctx.Star[0]);
      this.createAstNode(AstNodes.IMPORT, parent, starToken);
    }

    if (ctx.As.length) {
      const asToken = this.extractToken(ctx.As[0]);
      this.createAstNode(AstNodes.AS, parent, asToken);
    }

    if (ctx?.Identifier && ctx.Identifier.length) {
      const idToken = this.extractToken(ctx.Identifier[0]);
      this.createAstNode(AstNodes.IMPORT_ID, parent, idToken);
    }

    if (ctx?.From && ctx.From.length) {
      const fromToken = this.extractToken(ctx.From[0]);
      this.createAstNode(AstNodes.FROM, parent, fromToken);
    }

    if (ctx?.StringLiteral && ctx.StringLiteral.length) {
      const locationToken = this.extractToken(ctx.StringLiteral[0]);
      this.createAstNode(AstNodes.LOCATION_ID, parent, locationToken);
    }
  }

  importStatement(ctx: ImportStatementCstChildren, parent: CmdlNode) {
    if (ctx?.Import && ctx.Import.length) {
      const importToken = this.extractToken(ctx.Import[0]);
      this.createAstNode(AstNodes.IMPORT, parent, importToken);
    }

    if (ctx?.Identifier && ctx.Identifier.length) {
      const idToken = this.extractToken(ctx.Identifier[0]);
      this.createAstNode(AstNodes.IMPORT_ID, parent, idToken);
    }

    if (ctx.alias && ctx.alias.length) {
      const aliasNode = this.createAstNode(AstNodes.ALIAS, parent);
      this.visit(ctx.alias, aliasNode);
    }

    if (ctx?.From && ctx.From.length) {
      const fromToken = this.extractToken(ctx.From[0]);
      this.createAstNode(AstNodes.FROM, parent, fromToken);
    }

    if (ctx?.StringLiteral && ctx.StringLiteral.length) {
      const locationToken = this.extractToken(ctx.StringLiteral[0]);
      this.createAstNode(AstNodes.LOCATION_ID, parent, locationToken);
    }
  }

  aliasClause(ctx: AliasClauseCstChildren, parent: CmdlNode) {
    if (ctx.As.length) {
      const asToken = this.extractToken(ctx.As[0]);
      this.createAstNode(AstNodes.AS, parent, asToken);
    }

    if (ctx.Identifier.length) {
      const idToken = this.extractToken(ctx.Identifier[0]);
      this.createAstNode(AstNodes.ALIAS_ID, parent, idToken);
    }
  }

  groupDeclaration(ctx: GroupDeclarationCstChildren, parent: CmdlNode) {
    let token: CmdlToken;
    let group: CmdlNode;

    if (ctx?.Identifier && ctx.Identifier.length) {
      token = this.extractToken(ctx.Identifier[0]);
      group = this.createAstNode(AstNodes.GROUP, parent, token);
      if (ctx?.group && ctx.group.length) {
        this.visit(ctx.group[0], group);
      }
    } else if (ctx?.variableGroup && ctx.variableGroup.length) {
      group = this.createAstNode(AstNodes.GROUP, parent);
      this.visit(ctx.variableGroup, group);
      if (ctx?.group && ctx.group.length) {
        this.visit(ctx.group[0], group);
      }
    } else if (ctx?.referenceDeclaration && ctx.referenceDeclaration.length) {
      group = this.createAstNode(AstNodes.REF_GROUP, parent);
      this.visit(ctx.referenceDeclaration, group);
      if (ctx?.group && ctx.group.length) {
        this.visit(ctx.group[0], group);
      }
    } else if (ctx?.namedGroup && ctx.namedGroup.length) {
      group = this.createAstNode(AstNodes.GROUP, parent);
      this.visit(ctx.namedGroup, group);
      if (ctx?.group && ctx.group.length) {
        this.visit(ctx.group[0], group);
      }
    } else {
      //create error => missing group identifier
    }
  }

  namedGroup(ctx: NamedGroupCstChildren, parent: CmdlNode) {
    let nameToken: CmdlToken;
    let idToken: CmdlToken;

    if (ctx.Keyword && ctx.Keyword.length) {
      nameToken = this.extractToken(ctx.Keyword[0]);
      parent.addTokenValues(nameToken);
    }

    if (ctx?.Identifier && ctx.Identifier.length) {
      idToken = this.extractToken(ctx.Identifier[0]);
      this.createAstNode(AstNodes.GROUP_ID, parent, idToken);
    }
  }

  variableGroup(ctx: VariableGroupCstChildren, parent: CmdlNode) {
    let nameToken: CmdlToken;
    let idToken: CmdlToken;

    if (ctx.Keyword && ctx.Keyword.length) {
      nameToken = this.extractToken(ctx.Keyword[0]);
      parent.addTokenValues(nameToken);
    }

    if (ctx?.Variable && ctx.Variable.length) {
      idToken = this.extractToken(ctx.Variable[0]);
      this.createAstNode(AstNodes.GROUP_ID, parent, idToken);
    }
  }

  referenceDeclaration(ctx: ReferenceDeclarationCstChildren, parent: CmdlNode) {
    if (!ctx.Link[0]) {
      //create errors
      return;
    }

    const refToken = this.extractToken(ctx.Link[0]);
    parent.addTokenValues(refToken);

    if (ctx?.Identifier && ctx.Identifier.length) {
      let token: CmdlToken;
      let currParent = parent;

      for (const subId of ctx.Identifier) {
        token = this.extractToken(subId);
        let subNode = this.createAstNode(
          AstNodes.REF_ID_PROP,
          currParent,
          token
        );
        currParent = subNode;
      }
    }
  }

  group(ctx: GroupCstChildren, parent: CmdlNode) {
    if (ctx.LCurly && ctx.LCurly.length) {
      let lCurl = this.extractToken(ctx.LCurly[0]);
      this.createAstNode(AstNodes.GROUP_LCURL, parent, lCurl);
    }

    if (ctx?.groupItem && ctx.groupItem.length) {
      ctx.groupItem.forEach((item) => {
        this.visit(item, parent);
      });
    }

    if (ctx.RCurly && ctx.RCurly.length) {
      let rCurl = this.extractToken(ctx.RCurly[0]);
      this.createAstNode(AstNodes.GROUP_RCURL, parent, rCurl);
    }
  }

  groupItem(ctx: GroupItemCstChildren, parent: CmdlNode) {
    if (ctx?.groupDeclaration) {
      this.visit(ctx.groupDeclaration, parent);
    } else if (ctx?.propertyItem) {
      this.visit(ctx.propertyItem, parent);
    } else if (ctx.arrowProperty) {
      this.visit(ctx.arrowProperty, parent);
    } else {
      // create error => bad group item
    }
  }

  propertyItem(ctx: PropertyItemCstChildren, parent: CmdlNode) {
    const propNode = this.createAstNode(AstNodes.PROP_DEC, parent);

    if (ctx.Identifier.length) {
      let idToken = this.extractToken(ctx.Identifier[0]);
      this.createAstNode(AstNodes.PROP_ID, propNode, idToken);
    }

    if (ctx.value.length) {
      this.visit(ctx.value, propNode);
    }
  }

  value(ctx: ValueCstChildren, parent: CmdlNode) {
    let token: CmdlToken;
    const propValue = this.createAstNode(AstNodes.PROP_VALUE, parent);
    if (ctx?.numericalValue) {
      this.visit(ctx.numericalValue, propValue);
    } else if (ctx?.list) {
      this.visit(ctx.list, propValue);
    } else if (ctx?.StringLiteral && ctx.StringLiteral.length) {
      const stringPropNode = this.createAstNode(
        AstNodes.STRING_VALUE,
        propValue
      );
      token = this.extractToken(ctx.StringLiteral[0]);
      this.createAstNode(AstNodes.STRING_VALUE, stringPropNode, token);
    } else if (ctx?.refList) {
      this.visit(ctx.refList, propValue);
    } else if (ctx?.referenceDeclaration) {
      const refValue = this.createAstNode(AstNodes.REF_VALUE, propValue);
      this.visit(ctx.referenceDeclaration, refValue);
    } else if (ctx?.True && ctx.True.length) {
      token = this.extractToken(ctx.True[0]);
      this.createAstNode(AstNodes.BOOL_VALUE, propValue, token);
    } else if (ctx?.False && ctx.False.length) {
      token = this.extractToken(ctx.False[0]);
      this.createAstNode(AstNodes.BOOL_VALUE, propValue, token);
    } else if (ctx?.Variable && ctx.Variable.length) {
      token = this.extractToken(ctx.Variable[0]);
      this.createAstNode(AstNodes.VAR_VALUE, propValue, token);
    } else {
      //! push errors to AST class
    }
  }

  list(ctx: ListCstChildren, parent: CmdlNode) {
    if (ctx.LSquare && ctx.LSquare.length) {
      let lCurl = this.extractToken(ctx.LSquare[0]);
      this.createAstNode(AstNodes.PROP_LSQUARE, parent, lCurl);
    }

    let token: CmdlToken;
    for (const value of ctx.StringLiteral) {
      token = this.extractToken(value);
      this.createAstNode(AstNodes.STRING_VALUE, parent, token);
    }

    if (ctx?.RSquare && ctx.RSquare.length) {
      let lCurl = this.extractToken(ctx.RSquare[0]);
      this.createAstNode(AstNodes.PROP_RSQUARE, parent, lCurl);
    }
  }

  refList(ctx: RefListCstChildren, parent: CmdlNode) {
    if (ctx?.LSquare && ctx.LSquare.length) {
      let lCurl = this.extractToken(ctx.LSquare[0]);
      this.createAstNode(AstNodes.PROP_LSQUARE, parent, lCurl);
    }

    if (ctx.referenceDeclaration && ctx.referenceDeclaration.length) {
      for (const ref of ctx.referenceDeclaration) {
        const refList = this.createAstNode(AstNodes.REF, parent);
        this.visit(ref, refList);
      }
    }

    if (ctx.RSquare && ctx.RSquare.length) {
      let lCurl = this.extractToken(ctx.RSquare[0]);
      this.createAstNode(AstNodes.PROP_RSQUARE, parent, lCurl);
    }
  }

  arrowProperty(ctx: ArrowPropertyCstChildren, parent: CmdlNode) {
    if (ctx.RAngle && ctx.RAngle.length) {
      let lCurl = this.extractToken(ctx.RAngle[0]);
      this.createAstNode(AstNodes.PROP_LSQUARE, parent, lCurl);
    }

    if (ctx.lhs && ctx.lhs.length) {
      let angleLHS = this.createAstNode(AstNodes.PROP_ANGLE_LHS, parent);
      this.visit(ctx.lhs, angleLHS);
    }

    if (ctx.Arrow && ctx.Arrow.length) {
      let arrow = this.extractToken(ctx.Arrow[0]);
      this.createAstNode(AstNodes.PROP_ANGLE_ARROW, parent, arrow);
    }

    if (ctx.rhs && ctx.rhs.length) {
      let angleLHS = this.createAstNode(AstNodes.PROP_ANGLE_RHS, parent);
      this.visit(ctx.rhs, angleLHS);
    }

    if (ctx.LAngle && ctx.LAngle.length) {
      let lCurl = this.extractToken(ctx.LAngle[0]);
      this.createAstNode(AstNodes.PROP_LSQUARE, parent, lCurl);
    }

    if (ctx.NumberLiteral && ctx.NumberLiteral.length) {
      const value = this.extractToken(ctx.NumberLiteral[0]);
      this.createAstNode(AstNodes.VALUE, parent, value);
    }
  }

  referencePipe(ctx: ReferencePipeCstChildren, parent: CmdlNode) {
    if (ctx?.referenceDeclaration && ctx.referenceDeclaration.length) {
      for (const ref of ctx.referenceDeclaration) {
        let refValue = this.createAstNode(AstNodes.REF, parent);
        this.visit(ref, refValue);
      }
    }
  }

  numericalValue(ctx: NumericalValueCstChildren, parent: CmdlNode) {
    let valueToken: CmdlToken;
    if (ctx?.value && ctx.value.length) {
      valueToken = this.extractToken(ctx.value[0]);
      this.createAstNode(AstNodes.VALUE, parent, valueToken);
    } else {
      //error
    }

    if (ctx?.uncertainty && ctx.uncertainty.length) {
      this.visit(ctx.uncertainty, parent);
    }

    let unitToken: CmdlToken;
    if (ctx?.unit && ctx.unit.length) {
      unitToken = this.extractToken(ctx.unit[0]);
      this.createAstNode(AstNodes.UNIT, parent, unitToken);
    } else {
      //error => bad things have happend
    }
  }

  uncertaintyExpression(
    ctx: UncertaintyExpressionCstChildren,
    parent: CmdlNode
  ) {
    let token: CmdlToken;
    if (ctx?.NumberLiteral && ctx.NumberLiteral.length) {
      token = this.extractToken(ctx.NumberLiteral[0]);
      this.createAstNode(AstNodes.UNCERTAINTY, parent, token);
    } else {
      // push error to ast
    }
  }

  private createAstNode(name: string, parent: CmdlNode, token?: CmdlToken) {
    const astNode = new CmdlNode(name);
    astNode.parent = parent;
    parent.add(astNode);

    if (token) {
      astNode.addTokenValues(token);
    }
    return astNode;
  }

  private extractToken(token: IToken): CmdlToken {
    return {
      image: token.image,
      type: token.tokenType.name,
      startLine: token.startLine,
      endLine: token.endLine,
      startOffset: token.startOffset,
      endOffset: token.endOffset,
    };
  }
}
