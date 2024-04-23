import { CSTVisitor } from "./parser/cst-visitor";
import { lexerInstance, parserInstance } from "./parser";
import { CMDLAst } from "./ast";
import { ParserError } from "./errors/errors";
import { IRecognitionException } from "chevrotain";

/**
 * Compiler for TYPES. Lexes and parses CMDL syntax.
 */
export class CmdlParser {
  private readonly treeVisitor = new CSTVisitor();

  /**
   * Lexes and parses CMDL into a CMDLTree for further evaluation
   * @param text string CMDL text being parsed
   * @returns Object<string, CMDLTree | ParserError[]
   */
  public parse(text: string): {
    recordTree: CMDLAst;
    parserErrors: ParserError[];
  } {
    const lexingResult = lexerInstance.tokenize(text);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parse();
    const cmdlAst = new CMDLAst();
    this.treeVisitor.visit(cst, cmdlAst.getRoot());
    const parserErrors = this.createParserErrors(parserInstance.errors);

    return { recordTree: cmdlAst, parserErrors };
  }

  /**
   * Converts errors from parser to Cmdl ParserError class
   * @param errArr IRecognitionException[]
   * @returns ParserError[]
   */
  private createParserErrors(errArr: IRecognitionException[]): ParserError[] {
    if (!errArr.length) {
      return [];
    }
    return errArr.map((el) => new ParserError(el));
  }
}
