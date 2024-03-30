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

export enum TokenLabel {
  BOOL_VALUE = "BOOLEAN_VALUE",
  COL_NAME = "COLLECTION_NAME",
  EDGE_VALUE = "EDGE_VALUE",
  END_COL_NAME = "END_COLLECTION_NAME",
  GRAPH_NAME = "GRAPH_NAME",
  IMPORT_ALIAS = "IMPORT_ALIAS",
  IMPORT_NAME = "IMPORT_NAME",
  IMPORT_SOURCE = "IMPORT_SOURCE",
  NUM_VALUE = "NUM_VALUE",
  NUM_UNIT = "NUM_UNIT",
  PROP_NAME = "PROP_NAME",
  RECORD_NAME = "RECORD_NAME",
  REF_NAME = "REFERENCE_NAME",
  REF_ITEM = "REF_ITEM",
  STR_VALUE = "STR_VALUE",
  TYPE = "TYPE",
  UNC_VALUE = "UNC_VALUE",
}

/**
 * Parser class for CMDL
 */
class Parser extends CstParser {
  constructor() {
    super(tokenVocabulary, { recoveryEnabled: true });

    this.performSelfAnalysis();
  }

  public parse = this.RULE("document", () => {
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
    this.CONSUME(Prop);
    this.CONSUME(Identifier, { LABEL: TokenLabel.PROP_NAME });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: TokenLabel.TYPE });
    this.CONSUME(Assignment);
    this.CONSUME(StringLiteral);
    this.CONSUME(SemiColon);
  });

  private collectionDeclaration = this.RULE("collectionDeclaration", () => {
    this.CONSUME(Collection);
    this.CONSUME(Identifier, { LABEL: TokenLabel.COL_NAME });
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
    this.CONSUME1(Identifier, { LABEL: TokenLabel.END_COL_NAME });
  });

  private importStatement = this.RULE("importStatement", () => {
    this.CONSUME(Import);
    this.CONSUME(Identifier, { LABEL: TokenLabel.IMPORT_NAME });
    this.OPTION(() => {
      this.SUBRULE(this.aliasClause, { LABEL: TokenLabel.IMPORT_ALIAS });
    });
    this.CONSUME(From);
    this.CONSUME(StringLiteral, { LABEL: TokenLabel.IMPORT_SOURCE });
    this.CONSUME(SemiColon);
  });

  private aliasClause = this.RULE("aliasClause", () => {
    this.CONSUME(As);
    this.CONSUME1(Identifier);
  });

  private recordDeclaration = this.RULE("recordDeclaration", () => {
    this.CONSUME(Record);
    this.CONSUME(Identifier, { LABEL: TokenLabel.RECORD_NAME });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: TokenLabel.TYPE });
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
    this.CONSUME(Graph);
    this.CONSUME(Identifier, { LABEL: TokenLabel.GRAPH_NAME });
    this.CONSUME(Colon);
    this.CONSUME1(Identifier, { LABEL: TokenLabel.TYPE });
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
    this.CONSUME(Reference, { LABEL: TokenLabel.REF_NAME });
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Dot);
        this.CONSUME(Identifier, { LABEL: TokenLabel.REF_ITEM });
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
      this.CONSUME(NumberLiteral, { LABEL: TokenLabel.EDGE_VALUE });
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
    this.CONSUME(Identifier, { LABEL: TokenLabel.PROP_NAME });
    this.CONSUME(Colon);
    this.OR([
      { ALT: () => this.CONSUME(True, { LABEL: TokenLabel.BOOL_VALUE }) },
      { ALT: () => this.CONSUME(False, { LABEL: TokenLabel.BOOL_VALUE }) },
      {
        ALT: () => this.CONSUME(StringLiteral, { LABEL: TokenLabel.STR_VALUE }),
      },
      { ALT: () => this.SUBRULE(this.numericalValue) },
      { ALT: () => this.SUBRULE(this.refValue) },
      { ALT: () => this.SUBRULE(this.list) },
      { ALT: () => this.SUBRULE(this.referenceList) },
    ]);
  });

  private refValue = this.RULE("referenceValue", () => {
    this.CONSUME(Reference, { LABEL: TokenLabel.REF_NAME });
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Dot);
        this.CONSUME(Identifier, { LABEL: TokenLabel.REF_ITEM });
      });
    });
  });

  private list = this.RULE("list", () => {
    this.CONSUME(LSquare);
    this.CONSUME(StringLiteral, { LABEL: TokenLabel.STR_VALUE });
    this.OPTION(() => {
      this.MANY(() => {
        this.CONSUME(Comma);
        this.CONSUME1(StringLiteral, { LABEL: TokenLabel.STR_VALUE });
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
    this.CONSUME(NumberLiteral);
    this.OPTION(() => {
      this.CONSUME(UncertaintyOperator);
      this.CONSUME1(NumberLiteral, { LABEL: TokenLabel.UNC_VALUE });
    });
    this.OPTION1(() => {
      this.CONSUME(Identifier, { LABEL: TokenLabel.NUM_UNIT });
    });
  });
}

export const parserInstance = new Parser();
