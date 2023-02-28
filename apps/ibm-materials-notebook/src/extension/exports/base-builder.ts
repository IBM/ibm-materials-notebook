export interface RecordBuilder {
  record: BaseRecord;
  setMetadata(arg: any): void;
  setReferences(ref: any): void;
  getResult(): any;
  reset(): void;
}

interface RecordMetadata {
  dateCreated: string;
  notebookId: string;
  template: string;
  record_id: string;
}

export interface ExperimentMetadata extends RecordMetadata {
  exp_id: string;
}

/**
 * Base class for record exports
 */
export abstract class BaseRecord {
  title?: string;
  metadata?: RecordMetadata;
  tags: string[] = [];
  references: Record<string, any> = {};

  /**
   * Creates metadata for the record
   * @param arg any
   */
  abstract setMetadata(arg: any): void;
  /**
   * Creates Refrences for the record
   * @param arg any
   */
  abstract setReference(arg: any): void;
  /**
   * Basic validation of record export
   */
  abstract validate(): boolean;
  /**
   * Returns the compilied record values
   */
  abstract export(): any;
}
