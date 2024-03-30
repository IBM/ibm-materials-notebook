import {
  Lexer,
  createToken,
  TokenType,
  IMultiModeLexerDefinition,
} from "chevrotain";

export enum TokenTypes {
  ALIAS = "ALIAS",
  ARROW = "ARROW",
  AS = "AS",
  ASSIGNMENT = "ASSIGNMENT",
  COLLECTION = "COLLECTION",
  COLON = "COLON",
  COMMA = "COMMA",
  DOT = "DOT",
  END = "END",
  FALSE = "FALSE",
  FROM = "FROM",
  GRAPH = "GRAPH",
  IMPORT = "IMPORT",
  IDENTIFIER = "IDENTIFIER",
  LANGLE = "LANGLE",
  LCURL = "LCURL",
  LSQUARE = "LSQUARE",
  NUM = "NUMBER_LITERAL",
  PIPE = "PIPE",
  PROP = "PROPERTY",
  RANGLE = "RANGLE",
  RCURL = "RCURL",
  RECORD = "RECORD",
  REF = "REFERENCE",
  RSQUARE = "RSQUARE",
  SEMICOLON = "SEMICOLON",
  STAR = "STAR",
  STRING = "STRING_LITERAL",
  SPACE = "WHITESPACE",
  TRUE = "TRUE",
  UNIT = "UNIT",
  UNC_OP = "UNCERTAINTY_OPERATOR",
  VALUE = "VALUE",
}

const tokenVocabulary: Record<string, TokenType> = {};

const IDENT_REGEX = /[_a-zA-Z0-9-/%]+/;
const REF = /@[_a-zA-Z0-9-]+/;
const STRING_LITERAL = /"(?:[^"]|\\(?:[bfnrtv"/]|u[0-9a-fA-F]{4}))+"/;
const NUM_REGEX = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
const UNC_REGEX = /±|\+-/;
const True = createToken({ name: TokenTypes.TRUE, pattern: /true/ });
const False = createToken({ name: TokenTypes.FALSE, pattern: /false/ });
const Star = createToken({ name: TokenTypes.STAR, pattern: /\*/ });
const LCurly = createToken({ name: TokenTypes.LCURL, pattern: /{/ });
const LSquare = createToken({ name: TokenTypes.LSQUARE, pattern: /\[/ });
const LAngle = createToken({ name: TokenTypes.LANGLE, pattern: /</ });
const Dot = createToken({ name: TokenTypes.DOT, pattern: /\./ });
const Arrow = createToken({ name: TokenTypes.ARROW, pattern: /=>/ }); //? add other arrow types to signify directions in graph
const Pipe = createToken({ name: TokenTypes.PIPE, pattern: /\|/ });
const RSquare = createToken({ name: TokenTypes.RSQUARE, pattern: /\]/ });
const RCurly = createToken({ name: TokenTypes.RCURL, pattern: /}/ });
const RAngle = createToken({ name: TokenTypes.RANGLE, pattern: />/ });
const Comma = createToken({ name: TokenTypes.COMMA, pattern: /,/ });
const Colon = createToken({ name: TokenTypes.COLON, pattern: /:/ });
const SemiColon = createToken({ name: TokenTypes.SEMICOLON, pattern: /;/ });
const Reference = createToken({ name: TokenTypes.REF, pattern: REF });
const Assignment = createToken({ name: TokenTypes.ASSIGNMENT, pattern: /:=/ });

const Identifier = createToken({
  name: TokenTypes.IDENTIFIER,
  pattern: IDENT_REGEX,
});

const StringLiteral = createToken({
  name: TokenTypes.STRING,
  pattern: STRING_LITERAL,
});
const From = createToken({
  name: TokenTypes.FROM,
  pattern: /from/,
  longer_alt: Identifier,
});

const Import = createToken({
  name: TokenTypes.IMPORT,
  pattern: /import/,
  longer_alt: Identifier,
});

const As = createToken({
  name: TokenTypes.AS,
  pattern: /as/,
  longer_alt: Identifier,
});

const Record = createToken({
  name: TokenTypes.RECORD,
  pattern: /record/,
});

const Graph = createToken({
  name: TokenTypes.GRAPH,
  pattern: /graph/,
});

const Collection = createToken({
  name: TokenTypes.COLLECTION,
  pattern: /collection/,
});

const End = createToken({
  name: TokenTypes.END,
  pattern: /end/,
});

const Prop = createToken({
  name: TokenTypes.PROP,
  pattern: /prop/,
});

const UncertaintyOperator = createToken({
  name: TokenTypes.UNC_OP,
  pattern: UNC_REGEX,
});
const NumberLiteral = createToken({
  name: TokenTypes.NUM,
  pattern: NUM_REGEX,
});

const WhiteSpace = createToken({
  name: TokenTypes.SPACE,
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// The order of tokens is important
const multiModeLexer: IMultiModeLexerDefinition = {
  modes: {
    // protocol_mode: [WhiteSpace, ProtoReference, MultiLineStr, BackTicClose],
    cmdl_mode: [
      WhiteSpace,
      NumberLiteral,
      Graph,
      Record,
      Prop,
      Collection,
      End,
      Import,
      Star,
      As,
      From,
      True,
      False,
      Reference,
      Identifier,
      UncertaintyOperator,
      Dot,
      Arrow,
      Pipe,
      RCurly,
      LCurly,
      LSquare,
      RSquare,
      RAngle,
      LAngle,
      Assignment,
      Colon,
      SemiColon,
      Comma,
      StringLiteral,
    ],
  },
  defaultMode: "cmdl_mode",
};

const allTokens = [
  WhiteSpace,
  NumberLiteral,
  Graph,
  Record,
  Collection,
  End,
  Prop,
  Import,
  Star,
  As,
  From,
  True,
  False,
  Reference,
  Identifier,
  UncertaintyOperator,
  Dot,
  Arrow,
  Pipe,
  RCurly,
  LCurly,
  LSquare,
  RSquare,
  RAngle,
  LAngle,
  Colon,
  SemiColon,
  Comma,
  Assignment,
  StringLiteral,
];

allTokens.forEach((tokenType) => {
  tokenVocabulary[tokenType.name] = tokenType;
});

const lexerInstance = new Lexer(multiModeLexer);

export {
  lexerInstance,
  allTokens,
  tokenVocabulary,
  WhiteSpace,
  NumberLiteral,
  StringLiteral,
  Identifier,
  UncertaintyOperator,
  Import,
  Star,
  From,
  RCurly,
  LCurly,
  LSquare,
  RSquare,
  Colon,
  SemiColon,
  Comma,
  True,
  False,
  Reference,
  Dot,
  Arrow,
  Pipe,
  RAngle,
  LAngle,
  As,
  Assignment,
  Graph,
  Record,
  Collection,
  Prop,
  End,
};
