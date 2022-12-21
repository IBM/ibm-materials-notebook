import { CstRecordVisitor } from "./composite-tree-visitor";
import { CstVisitor } from "./cst-visitor";
import { lexerInstance } from "./lexer";
import { parserInstance } from "./parser";
import { CmdlAst } from "./cmdl-ast";
import { CmdlTree } from "./cmdl-tree";
import { ParserError } from "./errors";
import { SymbolTable } from "./cmdl-symbols";
import { ErrorTable } from "../errors";
import { IRecognitionException } from "chevrotain";
import { cmdlLogger as logger } from "./logger";

export interface CompilerOuput {
  recordTree: CmdlTree;
}

export interface CompilerInput {
  text: string;
  uri: string;
  table: SymbolTable;
  errTable: ErrorTable;
}

/**
 * Compiler for CMDL. Lexes and parses CMDL syntax.
 */
export class CmdlCompiler {
  private readonly astVisitor = new CstVisitor();
  private readonly treeVisitor = new CstRecordVisitor();

  /**
   * Lexes and parses CMDL into a CMDLTree for further evaluation
   * @param text string CMDL text being parsed
   * @returns Object<string, CMDLTree | ParserError[]
   */
  public parse(text: string) {
    const lexingResult = lexerInstance.tokenize(text);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    const recordTree: CmdlTree = this.treeVisitor.visit(cst);
    const parserErrors = this.createParserErrors(parserInstance.errors);

    return { recordTree, parserErrors };
  }

  /**
   * Lexes and parses CMDL into CMDLAst. Used in CMDL completion providers
   * @param text string
   * @returns Object<string, CMDLAst | IRecognitionExemption[] | ILexingError[]>
   */
  public parseAST(text: string) {
    const lexingResult = lexerInstance.tokenize(text);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    const ast: CmdlAst = this.astVisitor.visit(cst, new CmdlAst());
    return {
      ast,
      parserErrors: parserInstance.errors,
      lexErrors: lexingResult.errors,
    };
  }

  private createParserErrors(errArr: IRecognitionException[]) {
    if (!errArr.length) {
      return [];
    }
    return errArr.map((el) => new ParserError(el));
  }
}
