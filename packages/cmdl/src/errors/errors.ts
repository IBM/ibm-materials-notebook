import { IRecognitionException } from "chevrotain";

export enum ErrorCode {
  MismatchedTokenException = "MismatchedTokenException",
  NotAllInputParsedException = "NotAllInputParsedException",
  NoViableAltException = "NoViableAltException",
  EarlyExitException = "EarlyExitException",
  DuplicatationError = "DuplicatationError",
  InvalidEntity = "InvalidEntity",
  ReferenceError = "ReferenceError",
  RangeError = "RangeError",
  MissingValue = "MissingValue",
  FileNotFound = "FileNotFound",
}

/**
 * Base error class for CMDL
 */
export abstract class CMDLError {
  /**
   * Creates a new instance of an Error for CMDL
   * @param code ErrorCode
   * @param message string
   * @param token CMDLToken | IToken | undefined
   */
  constructor(
    readonly code: ErrorCode,
    readonly message: string,
    readonly start: number,
    readonly stop: number
  ) {
    // const [start, stop] = this.getErrorRange(token);
    // this.start = start;
    // this.stop = stop;
  }

  /**
   * Gets text range of error based on recieved tokens
   * @param arg CMDLToken | IToken | undefined
   * @returns number[]
   */
  // private getErrorRange(arg: CMDLToken | IToken | undefined) {
  //   if (!arg) {
  //     return [0, 1];
  //   }
  //   const start = arg?.startOffset ? arg.startOffset : 0;
  //   const stop = arg?.endOffset ? arg?.endOffset + 1 : 1;
  //   return [start, stop];
  // }
}

/**
 * Errors encountered during CMDL parsing
 */
export class ParserError extends CMDLError {
  constructor(err: IRecognitionException) {
    super(
      err.name as ErrorCode,
      err.message,
      err.token.startOffset,
      err.token.endOffset ? err.token.endOffset : err.token.startOffset
    );
  }
}

/**
 * Describes error for duplication of a CMDL property or group
 */
export class DuplicationError extends CMDLError {
  constructor(msg: string, start: number, stop: number) {
    super(ErrorCode.DuplicatationError, msg, start, stop);
  }
}

/**
 * Invalid property error for properties not defined on a given group
 */
export class InvalidPropertyError extends CMDLError {
  constructor(msg: string, start: number, stop: number) {
    super(ErrorCode.InvalidEntity, msg, start, stop);
  }
}

/**
 * Error with references inside CMDL
 */
export class RefError extends CMDLError {
  constructor(msg: string, start: number, stop: number) {
    super(ErrorCode.ReferenceError, msg, start, stop);
  }
}

/**
 * Value for a CMDL property is not found
 */
export class MissingValueError extends CMDLError {
  constructor(msg: string, start: number, stop: number) {
    super(ErrorCode.MissingValue, msg, start, stop);
  }
}

/**
 * Errors for imported files which are not found
 */
export class IOError extends CMDLError {
  constructor(msg: string, start: number, stop: number) {
    super(ErrorCode.FileNotFound, msg, start, stop);
  }
}
