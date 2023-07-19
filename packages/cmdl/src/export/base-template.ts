import { Model } from "../intepreter";

export interface ExportStrategy {
  compile(arg: Model<unknown>[]): any;
}

export class CMDLExporter {
  strategy: ExportStrategy;

  constructor(defaultStrategy: ExportStrategy) {
    this.strategy = defaultStrategy;
  }

  public setStrategy(newStrategy: ExportStrategy): void {
    this.strategy = newStrategy;
  }

  public exportRecord(data: Model<unknown>[]): any {
    return this.strategy.compile(data);
  }
}
