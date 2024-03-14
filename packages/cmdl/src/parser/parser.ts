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
  Reference,
  Record,
  Graph,
  Collection,
  Prop,
  Import,
  From,
  LSquare,
  RSquare,
  Dot,
  Arrow,
  Pipe,
  RAngle,
  LAngle,
  As,
  Assignment,
  End,
} from "./tokens";

/**
 * Parser class for CMDL
 */
class Parser extends CstParser {
  constructor() {
    super(tokenVocabulary, { recoveryEnabled: true });

    this.performSelfAnalysis();
  }

  public parse = this.RULE("cmdl-document", () => {
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.importStatement) },
        { ALT: () => this.SUBRULE(this.collectionDeclaration) },
        { ALT: () => this.SUBRULE(this.recordDeclaration) },
        { ALT: () => this.SUBRULE(this.graphDeclaration) },
        { ALT: () => this.SUBRULE(this.assignmentDeclaration) },
      ]);
    });
  });

  private assignmentDeclaration = this.RULE("assignmentProperty", () => {
    this.CONSUME(Prop, { LABEL: "Keyword" });
    this.CONSUME(Identifier, { LABEL: "Identifier" });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: "Type" });
    this.CONSUME(Assignment);
    this.CONSUME(StringLiteral);
    this.CONSUME(SemiColon);
  });

  private collectionDeclaration = this.RULE("collectionDeclaration", () => {
    this.CONSUME(Collection, { LABEL: "keyword" });
    this.CONSUME(Identifier, { LABEL: "collectionName" });
    this.OPTION(() => {
      this.MANY(() => {
        this.OR([
          { ALT: () => this.SUBRULE(this.assignmentDeclaration) },
          { ALT: () => this.SUBRULE(this.recordDeclaration) },
          { ALT: () => this.SUBRULE(this.graphDeclaration) },
          { ALT: () => this.SUBRULE(this.collectionDeclaration) },
        ]);
      });
    });
    this.CONSUME(End);
    this.CONSUME1(Identifier, { LABEL: "collectionName" });
  });

  private importStatement = this.RULE("importStatement", () => {
    this.CONSUME(Import, { LABEL: "Keyword" });
    this.CONSUME(Identifier);
    this.OPTION(() => {
      this.SUBRULE(this.aliasClause, { LABEL: "Alias" });
    });
    this.CONSUME(From, { LABEL: "Keyword" });
    this.CONSUME(StringLiteral);
    this.CONSUME(SemiColon);
  });

  private aliasClause = this.RULE("aliasClause", () => {
    this.CONSUME(As);
    this.CONSUME1(Identifier);
  });

  private recordDeclaration = this.RULE("recordDeclaration", () => {
    this.CONSUME(Record, { LABEL: "Keyword" });
    this.CONSUME(Identifier, { LABEL: "Identifier" });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: "Type" });
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.OR1([
        { ALT: () => this.SUBRULE(this.propertyItem) },
        { ALT: () => this.SUBRULE(this.referenceDeclaration) },
      ]);
      this.CONSUME(SemiColon);
    });
    this.CONSUME(RCurly);
  });

  private graphDeclaration = this.RULE("graphDeclaration", () => {
    this.CONSUME(Graph, { LABEL: "Keyword" });
    this.CONSUME(Identifier, { LABEL: "Identifier" });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: "Type" });
    this.CONSUME(LCurly);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.arrowProperty) },
        { ALT: () => this.SUBRULE(this.propertyItem) },
      ]);
      this.CONSUME(SemiColon);
    });
    this.CONSUME(RCurly);
  });

  private referenceDeclaration = this.RULE("referenceDeclaration", () => {
    this.CONSUME(Reference, { LABEL: "Reference" });
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Dot);
        this.CONSUME(Identifier, { LABEL: "Member" });
      });
    });
    this.CONSUME(LCurly);
    this.OR([
      {
        ALT: () =>
          this.MANY1(() => {
            this.SUBRULE(this.propertyItem);
            this.CONSUME(SemiColon);
          }),
      },
    ]);
    this.CONSUME(RCurly);
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
    this.SUBRULE(this.refValue);
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Pipe);
        this.SUBRULE1(this.refValue);
      });
    });
  });

  private propertyItem = this.RULE("propertyItem", () => {
    this.CONSUME(Identifier, { LABEL: "propertyName" });
    this.CONSUME(Colon);
    this.SUBRULE(this.value);
  });

  private value = this.RULE("propertyValue", () => {
    this.OR([
      { ALT: () => this.CONSUME(True) },
      { ALT: () => this.CONSUME(False) },
      { ALT: () => this.CONSUME(StringLiteral) },
      { ALT: () => this.SUBRULE(this.numericalValue) },
      { ALT: () => this.SUBRULE(this.refValue) },
      { ALT: () => this.SUBRULE(this.list) },
      { ALT: () => this.SUBRULE(this.referenceList) },
    ]);
  });

  private refValue = this.RULE("referenceValue", () => {
    this.CONSUME(Reference, { LABEL: "Reference" });
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Dot);
        this.CONSUME(Identifier, { LABEL: "Member" });
      });
    });
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
        this.SUBRULE(this.refValue);
      },
    });
    this.CONSUME(RSquare);
  });

  private numericalValue = this.RULE("numericalValue", () => {
    this.CONSUME(NumberLiteral, { LABEL: "number" });
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
