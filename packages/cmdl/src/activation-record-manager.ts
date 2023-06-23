import { Controller } from "./controller";
import { ModelVisitor, ModelARManager } from "./intepreter";
import { logger } from "./logger";

/**
 * Caches execution results for each namespace
 */
export class ActivationRecordManager {
  private readonly _records = new Map<string, ModelARManager>();

  public create(namespace: string) {
    const manager = new ModelARManager(namespace);
    this._records.set(namespace, manager);
  }

  public createModelVisitor(
    namespace: string,
    controller: Controller,
    uri: string
  ): ModelVisitor {
    const manager = this.get(namespace);

    const documentAR = manager.createGlobalAR(uri);
    const modelVisitor = new ModelVisitor(documentAR, namespace, controller);
    return modelVisitor;
  }

  public get(namespace: string) {
    const manager = this._records.get(namespace);

    if (!manager) {
      throw new Error(
        `no activation record manager for namespace ${namespace}!`
      );
    }
    return manager;
  }

  public getOutput(namespace: string, uri: string) {
    const manager = this.get(namespace);
    const output = manager.getRecord(uri);
    return [...output.values()];
  }
}
