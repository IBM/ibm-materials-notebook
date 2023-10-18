import { CmdlCompiler } from "./cmdl-compiler";
import {
  ModelVisitor,
  ActivationRecordTable,
  Entity,
  Exportable,
} from "./intepreter";

/**
 * Caches execution results for each namespace
 */
export class ActivationRecordManager {
  private readonly _tables = new Map<string, ActivationRecordTable>();

  public create(namespace: string) {
    const namespaceAR = new ActivationRecordTable(namespace);
    this._tables.set(namespace, namespaceAR);
  }

  public createModelVisitor(
    namespace: string,
    controller: CmdlCompiler,
    uri: string
  ): ModelVisitor {
    const namespaceTable = this.get(namespace);
    const namespaceAR = namespaceTable.createGlobalAR(uri);
    const modelVisitor = new ModelVisitor(namespaceAR, namespace, controller);
    return modelVisitor;
  }

  public get(namespace: string) {
    const manager = this._tables.get(namespace);

    if (!manager) {
      throw new Error(
        `no activation record manager for namespace ${namespace}!`
      );
    }
    return manager;
  }

  public getOutput(namespace: string, uri: string): Exportable<unknown>[] {
    const namespaceTable = this.get(namespace);
    const record = namespaceTable.getRecord(uri);
    const finalOutput: Exportable<unknown>[] = [];

    for (const value of record.values()) {
      if (value instanceof Entity) {
        finalOutput.push(value);
      }
    }
    return finalOutput;
  }
}
