import {
  Lexer,
  createToken,
  TokenType,
  IMultiModeLexerDefinition,
} from "chevrotain";

const tokenVocabulary: Record<string, TokenType> = {};

const IDENT_REGEX = /[_a-zA-Z0-9-\/%]+/;
const LINK = /@[_a-zA-Z0-9-]+/;
const ProtocolRef = /\[\[@[_a-zA-Z0-9-]+\]\]/;
const VARIABLE = /\$[_a-zA-Z0-9-]+/;
const STRING_LITERAL = /"(?:[^\"]|\\(?:[bfnrtv"\/]|u[0-9a-fA-F]{4}))+"/;
const NUM_REGEX = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
const UNC_REGEX = /±|\+-/;
const MultiLineText = /[_a-zA-Z0-9-'\/%\.\s\\n\\r\\t]+/;
const MultiLineFormaters = /\\(?:[bfnrtv"\/])/;

const True = createToken({ name: "True", pattern: /true/ });
const False = createToken({ name: "False", pattern: /false/ });
const Star = createToken({ name: "Star", pattern: /\*/ });
const LCurly = createToken({ name: "LCurly", pattern: /{/ });
const LSquare = createToken({ name: "LSquare", pattern: /\[/ });
const LAngle = createToken({ name: "LAngle", pattern: /</ });
const Dot = createToken({ name: "Dot", pattern: /\./ });
const Arrow = createToken({ name: "Arrow", pattern: /=>/ });
const Pipe = createToken({ name: "Pipe", pattern: /\|/ });
const RSquare = createToken({ name: "RSquare", pattern: /\]/ });
const RCurly = createToken({ name: "RCurly", pattern: /}/ });
const RAngle = createToken({ name: "RAngle", pattern: />/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const SemiColon = createToken({ name: "Semicolon", pattern: /;/ });
const Link = createToken({ name: "Link", pattern: LINK });
const Variable = createToken({ name: "Variable", pattern: VARIABLE });
const Assignment = createToken({ name: "Assignment", pattern: /=:/ });
const BackTicOpen = createToken({
  name: "BackTic",
  pattern: /`/,
  push_mode: "protocol_mode",
});
const BackTicClose = createToken({
  name: "BackTic",
  pattern: /`/,
  pop_mode: true,
});
const Protocol = createToken({
  name: "ProtocolText",
  pattern: Lexer.NA,
});
const ProtoReference = createToken({
  name: "ProtocolRef",
  pattern: ProtocolRef,
  categories: [Protocol],
});
const MultiLineStr = createToken({
  name: "MultiLineStr",
  pattern: MultiLineText,
  categories: [Protocol],
});

const Identifier = createToken({
  name: "Identifier",
  pattern: IDENT_REGEX,
});

const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: STRING_LITERAL,
});
const From = createToken({
  name: "From",
  pattern: /from/,
  longer_alt: Identifier,
});

const Import = createToken({
  name: "Import",
  pattern: /import/,
  longer_alt: Identifier,
});

const As = createToken({
  name: "As",
  pattern: /as/,
  longer_alt: Identifier,
});

const UncertaintyOperator = createToken({
  name: "UncertaintyOperator",
  pattern: UNC_REGEX,
});
const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: NUM_REGEX,
});

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

// The order of tokens is important
const multiModeLexer: IMultiModeLexerDefinition = {
  modes: {
    protocol_mode: [WhiteSpace, ProtoReference, MultiLineStr, BackTicClose],
    cmdl_mode: [
      WhiteSpace,
      NumberLiteral,
      Import,
      Star,
      As,
      From,
      True,
      False,
      Link,
      BackTicOpen,
      Variable,
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
  Import,
  Star,
  As,
  From,
  True,
  False,
  Link,
  BackTicOpen,
  Variable,
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
  Protocol,
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
  Link,
  Variable,
  Dot,
  Arrow,
  Pipe,
  RAngle,
  LAngle,
  As,
  BackTicOpen,
  BackTicClose,
  ProtoReference,
  Protocol,
  MultiLineStr,
  Assignment,
};
