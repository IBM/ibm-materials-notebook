import { TAGS, CMDLMetaData, CMDLRecordRefs, CMDLRecordTypes } from "cmdl";
import { ExpRecord } from "./exp-builder";
import { FlowRecord } from "./flow-exp-builder";

export interface RecordBuilder {
  record: BaseRecord;
  setMetadata(arg: CMDLMetaData): void;
  setReferences(ref: any): void;
  getResult(): any;
  reset(): void;
}

interface RecordMetadata {
  dateCreated: string;
  notebookId?: string;
  template: string;
  record_id?: string;
}

export interface ExperimentMetadata extends RecordMetadata {
  exp_id?: string;
}

/**
 * Base class for record exports
 */
export abstract class BaseRecord {
  title?: string;
  metadata?: RecordMetadata;
  tags?: TAGS[] = [];
  references: Record<string, CMDLRecordRefs> = {};

  /**
   * Creates metadata for the record
   * @param arg any
   */
  abstract setMetadata(arg: CMDLMetaData): void;
  /**
   * Creates Refrences for the record
   * @param arg any
   */
  abstract setReference(arg: CMDLRecordTypes): void;
  /**
   * Basic validation of record export
   */
  abstract validate(): boolean;
  /**
   * Returns the compilied record values
   */
  abstract export(): ExpRecord | FlowRecord;
}
