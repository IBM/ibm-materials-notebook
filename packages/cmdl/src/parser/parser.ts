import { CstParser } from "chevrotain";
import {
  tokenVocabulary,
  NumberLiteral,
  StringLiteral,
  UncertaintyOperator,
  RCurly,
  LCurly,
  Colon,
  SemiColon,
  Comma,
  True,
  False,
  Identifier,
  Link,
  Import,
  Export,
  From,
  LSquare,
  RSquare,
  Dot,
  Variable,
  Arrow,
  Pipe,
  RAngle,
  LAngle,
  As,
} from "./tokens";

/**
 * Parser class for CMDL
 */
class Parser extends CstParser {
  constructor() {
    super(tokenVocabulary, { recoveryEnabled: true });

    this.performSelfAnalysis();
  }

  public parseRecord = this.RULE("record", () => {
    this.MANY(() => {
      this.SUBRULE(this.statement);
    });
  });

  private statement = this.RULE("statement", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.importStatement) },
      { ALT: () => this.SUBRULE(this.groupDeclaration) },
    ]);
  });

  private importStatement = this.RULE("importStatement", () => {
    this.CONSUME(Import);
    this.CONSUME(Identifier);
    this.OPTION(() => {
      this.SUBRULE(this.aliasClause, { LABEL: "alias" });
    });
    this.CONSUME(From);
    this.CONSUME(StringLiteral);
    this.CONSUME(SemiColon);
  });

  private aliasClause = this.RULE("aliasClause", () => {
    this.CONSUME(As);
    this.CONSUME1(Identifier);
  });

  private groupDeclaration = this.RULE("groupDeclaration", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.namedGroup) },
      { ALT: () => this.SUBRULE(this.variableGroup) },
      { ALT: () => this.SUBRULE(this.referenceDeclaration) },
      { ALT: () => this.CONSUME(Identifier) },
    ]);
    this.SUBRULE(this.group);
  });

  private namedGroup = this.RULE("namedGroup", () => {
    this.CONSUME(Identifier, { LABEL: "Keyword" });
    this.CONSUME1(Identifier);
  });

  private variableGroup = this.RULE("variableGroup", () => {
    this.CONSUME(Identifier, { LABEL: "Keyword" });
    this.CONSUME1(Variable);
  });

  private referenceDeclaration = this.RULE("referenceDeclaration", () => {
    this.CONSUME(Link);
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Dot);
        this.CONSUME(Identifier);
      });
    });
  });

  private group = this.RULE("group", () => {
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.SUBRULE(this.groupItem);
      this.CONSUME(SemiColon);
    });
    this.CONSUME(RCurly);
  });

  private groupItem = this.RULE("groupItem", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.arrowProperty) },
      { ALT: () => this.SUBRULE(this.propertyItem) },
      { ALT: () => this.SUBRULE(this.groupDeclaration) },
    ]);
  });

  private arrowProperty = this.RULE("arrowProperty", () => {
    this.CONSUME(LAngle);
    this.SUBRULE(this.referencePipe, { LABEL: "lhs" });
    this.CONSUME(Arrow);
    this.SUBRULE1(this.referencePipe, { LABEL: "rhs" });
    this.CONSUME(RAngle);
    this.OPTION(() => {
      this.CONSUME(Colon);
      this.CONSUME(NumberLiteral);
    });
  });

  private referencePipe = this.RULE("referencePipe", () => {
    this.SUBRULE(this.referenceDeclaration);
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Pipe);
        this.SUBRULE1(this.referenceDeclaration);
      });
    });
  });

  private propertyItem = this.RULE("propertyItem", () => {
    this.CONSUME(Identifier);
    this.CONSUME(Colon);
    this.SUBRULE(this.value);
  });

  private value = this.RULE("value", () => {
    this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.CONSUME(Variable) },
      { ALT: () => this.SUBRULE(this.numericalValue) },
      { ALT: () => this.SUBRULE(this.referenceDeclaration) },
      { ALT: () => this.SUBRULE(this.list) },
      { ALT: () => this.SUBRULE(this.referenceList) },
    ]);
  });

  private list = this.RULE("list", () => {
    this.CONSUME(LSquare);
    this.CONSUME(StringLiteral);
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Comma);
        this.CONSUME1(StringLiteral);
      });
    });
    this.CONSUME(RSquare);
  });

  private referenceList = this.RULE("refList", () => {
    this.CONSUME(LSquare);
    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.referenceDeclaration);
      },
    });
    this.CONSUME(RSquare);
  });

  private numericalValue = this.RULE("numericalValue", () => {
    this.CONSUME(NumberLiteral, { LABEL: "value" });
    this.OPTION(() =>
      this.SUBRULE(this.uncertaintyExpression, { LABEL: "uncertainty" })
    );
    this.OPTION1(() => {
      this.CONSUME(Identifier, { LABEL: "unit" });
    });
  });

  private uncertaintyExpression = this.RULE("uncertaintyExpression", () => {
    this.CONSUME(UncertaintyOperator);
    this.CONSUME(NumberLiteral);
  });
}

export const parserInstance = new Parser();
