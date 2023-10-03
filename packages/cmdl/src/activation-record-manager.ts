import { Controller } from "./controller";
import { ModelVisitor, ModelARManager, Model, Exportable } from "./intepreter";
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

  public getOutput(namespace: string, uri: string): Exportable<unknown>[] {
    const manager = this.get(namespace);
    const arValues = manager.getRecord(uri);
    const finalOutput: Exportable<unknown>[] = [];

    for (const value of arValues.values()) {
      if (value instanceof Model) {
        finalOutput.push(value);
      }
    }
    return finalOutput;
  }
}
