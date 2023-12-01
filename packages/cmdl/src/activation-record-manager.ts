import { CmdlCompiler } from "./cmdl-compiler";
import {
  CharDataRender,
  ChemicalRender,
  PolymerRender,
  ReactionRender,
  ResultRender,
} from "./cmdl-types/types";
import { ModelVisitor, ActivationRecordTable, Exportable } from "./intepreter";
import {
  CharDataEntity,
  ChemicalEntity,
  PolymerEntity,
  ReactionEntity,
  ResultEntity,
} from "./intepreter/entities";

export type CellRenderOutput = {
  reactions: ReactionRender[];
  chemicals: ChemicalRender[];
  polymers: PolymerRender[];
  charData: CharDataRender[];
  results: ResultRender[];
};

/**
 * Caches execution results for each file
 */
export class ActivationRecordManager {
  private readonly _tables = new Map<string, ActivationRecordTable>();

  /**
   * Method to create AR for a given file
   * @param fileName name of file for the AR
   */
  public create(fileName: string): void {
    const fileAR = new ActivationRecordTable(fileName);
    this._tables.set(fileName, fileAR);
  }

  /**
   * Method for creating a model visitor to perform execution on the CMDL
   * AST and cache results in the activation record
   * @param fileName name of file
   * @param compiler reference to the compiler
   * @param uri uri of document
   * @returns ModelVistor
   */
  public createModelVisitor(
    fileName: string,
    compiler: CmdlCompiler,
    uri: string
  ): ModelVisitor {
    const fileARTable = this.get(fileName);
    const fileGlobalAR = fileARTable.createGlobalAR(uri);
    const modelVisitor = new ModelVisitor(fileGlobalAR, fileName, compiler);
    return modelVisitor;
  }

  /**
   * Method for getting AR for file. Throws an error if
   * it does not exist.
   * @param fileName
   * @returns ActivationRecordTable
   */
  public get(fileName: string): ActivationRecordTable {
    const manager = this._tables.get(fileName);

    if (!manager) {
      throw new Error(`no activation record manager for file ${fileName}!`);
    }
    return manager;
  }

  /**
   * Method for retrieving execution results from the AR
   * @todo update type scheme to elimnate unknown type
   * @param fileName name of file to retrieve AR from
   * @param uri uri of text document or cell to retrieve output for
   * @returns unknown[]
   */
  public getOutput(fileName: string, uri: string): CellRenderOutput {
    const outputRecord: CellRenderOutput = {
      reactions: [],
      results: [],
      polymers: [],
      chemicals: [],
      charData: [],
    };
    const fileTable = this.get(fileName);
    const record = fileTable.getRecord(uri);

    for (const value of record.values()) {
      if (value instanceof ReactionEntity) {
        outputRecord.reactions.push(value.render());
      } else if (value instanceof ResultEntity) {
        outputRecord.results.push(value.render());
      } else if (value instanceof CharDataEntity) {
        outputRecord.charData.push(value.render());
      } else if (value instanceof PolymerEntity) {
        outputRecord.polymers.push(value.render());
      } else if (value instanceof ChemicalEntity) {
        outputRecord.chemicals.push(value.render());
      } else {
        continue;
      }
    }
    return outputRecord;
  }

  /**
   * Method for getting output of
   * @param fileName filename of records to be retrieved
   * @param uri uri of text document or cell to get output from
   * @returns Exportable[]
   */
  public getRecordOutput(fileName: string, uri: string): Exportable[] {
    const fileTable = this.get(fileName);
    const record = fileTable.getRecord(uri);
    const finalOutput: Exportable[] = [];

    for (const value of record.values()) {
      if (
        value instanceof ReactionEntity ||
        value instanceof ResultEntity ||
        value instanceof CharDataEntity
      ) {
        finalOutput.push(value);
      }
    }
    return finalOutput;
  }
}
