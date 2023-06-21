import { ModelVisitor, ModelARManager } from "./intepreter";

/**
 * Caches execution results for each namespace
 */
export class ActivationRecordManager {
  private readonly _records = new Map<string, ModelARManager>();

  public create(namespace: string) {
    const manager = new ModelARManager(namespace);
    this._records.set(namespace, manager);
  }

  public createModelVisitor(namespace: string): ModelVisitor {
    const manager = this._records.get(namespace);

    if (!manager) {
      throw new Error(
        `no activation record manager for namespace ${namespace}!`
      );
    }

    const documentAR = manager.createGlobalAR(namespace);
    const modelVisitor = new ModelVisitor(documentAR, namespace);
    return modelVisitor;
  }

  public getOutput(namespace: string, uri: string) {
    const manager = this._records.get(namespace);

    if (!manager) {
      throw new Error(
        `no activation record manager for namespace ${namespace}!`
      );
    }

    const output = manager.getRecord(uri);
    return [...output.values()];
  }
}
