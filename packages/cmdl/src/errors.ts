import { IRecognitionException, IToken } from "chevrotain";
import { CmdlToken } from "./cmdl-ast";

export enum ErrorCode {
  MismatchedTokenException = "MismatchedTokenException",
  NotAllInputParsedException = "NotAllInputParsedException",
  NoViableAltException = "NoViableAltException",
  EarlyExitException = "EarlyExitException",
  DuplicateItem = "DuplicateItem",
  InvalidProperty = "InvalidProperty",
  InvalidGroup = "InvalidGroup",
  ReferenceError = "ReferenceError",
  RangeError = "RangeError",
  MissingValue = "MissingValue",
  FileNotFound = "FileNotFound",
}

/**
 * Base error class for CMDL
 */
export abstract class BaseError {
  readonly start: number;
  readonly stop: number;

  /**
   * Creates a new instance of an Error for CMDL
   * @param code ErrorCode
   * @param message string
   * @param token CMDLToken | IToken | undefined
   */
  constructor(
    readonly code: ErrorCode,
    readonly message: string,
    token: CmdlToken | IToken | undefined
  ) {
    const [start, stop] = this.getErrorRange(token);
    this.start = start;
    this.stop = stop;
  }

  /**
   * Gets text range of error based on recieved tokens
   * @param arg CmdlToken | IToken | undefined
   * @returns number[]
   */
  private getErrorRange(arg: CmdlToken | IToken | undefined) {
    if (!arg) {
      return [0, 1];
    }
    const start = arg?.startOffset ? arg.startOffset : 0;
    const stop = arg?.endOffset ? arg?.endOffset + 1 : 1;
    return [start, stop];
  }
}

/**
 * Errors encountered during CMDL parsing
 */
export class ParserError extends BaseError {
  constructor(err: IRecognitionException) {
    super(err.name as ErrorCode, err.message, err.token);
  }
}

/**
 * Describes error for duplication of a CMDL property or group
 */
export class DuplicationError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.DuplicateItem, msg, token);
  }
}

/**
 * Error for an invalid group or invalid group nesting in CMDL
 */
export class InvalidGroupError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.InvalidGroup, msg, token);
  }
}

/**
 * Invalid property error for properties not defined on a given group
 */
export class InvalidPropertyError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.InvalidProperty, msg, token);
  }
}

/**
 * Error with references inside CMDL
 */
export class RefError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.ReferenceError, msg, token);
  }
}

/**
 * Value for CMDL property outside of allowable range
 */
export class RangeError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.RangeError, msg, token);
  }
}

/**
 * Value for a CMDL property is not found
 */
export class MissingValueError extends BaseError {
  constructor(msg: string, token?: CmdlToken) {
    super(ErrorCode.MissingValue, msg, token);
  }
}

/**
 * Errors for imported files which are not found
 */
export class FileError extends BaseError {
  constructor(msg: string, token: CmdlToken) {
    super(ErrorCode.FileNotFound, msg, token);
  }
}
