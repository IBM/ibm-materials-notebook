import { CSTVisitor } from "./cmdl-cst-visitor";
import { lexerInstance, parserInstance } from "./parser";
import { CmdlTree } from "./cmdl-tree";
import { ParserError } from "./errors";
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
    recordTree: CmdlTree;
    parserErrors: ParserError[];
  } {
    const lexingResult = lexerInstance.tokenize(text);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parse();
    const recordTree: CmdlTree = this.treeVisitor.visit(cst);
    const parserErrors = this.createParserErrors(parserInstance.errors);

    return { recordTree, parserErrors };
  }

  /**
   * Lexes and parses CMDL into CMDLAst. Used in CMDL completion providers
   * @deprecated
   * @param text string
   * @returns Object<string, CMDLAst | IRecognitionExemption[] | ILexingError[]>
   */
  public parseAST(text: string) {
    // const lexingResult = lexerInstance.tokenize(text);
    // parserInstance.input = lexingResult.tokens;
    // const cst = parserInstance.parse();
    // let ast: CmdlAst | undefined;
    // try {
    //   ast = this.astVisitor.visit(cst, new CmdlAst());
    // } catch (error) {
    //   logger.error(`error creating CMDLAst: ${error}`);
    // }
    // return {
    //   ast,
    //   parserErrors: parserInstance.errors,
    //   lexErrors: lexingResult.errors,
    // };
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
