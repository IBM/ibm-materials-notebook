import { BaseRecord, RecordBuilder } from "./base-builder";

/**
 * Builds a record for a notebook document defining a reactor graph
 */
export class ReactorRecord extends BaseRecord {
  name?: string;
  graph?: Record<string, any>;
  components: any[] = [];

  setMetadata(arg: any): void {
    this.name = arg.name;
    this.tags = arg.tags;
    this.metadata = {
      notebookId: arg.notebookId,
      dateCreated: new Date(Date.now()).toISOString(),
      template: arg.template,
      record_id: arg.record_id,
    };
  }
  setReference(arg: any): void {
    if (this.references[arg.name]) {
      throw new Error(`Reference ${arg.name} already exists!`);
    } else {
      this.references[arg.name] = arg;
    }
  }
  validate() {
    if (!this.metadata || !this.name) {
      return false;
    } else {
      return true;
    }
  }
  export() {
    const newRecord: Record<string, any> = {
      name: this.name,
      tags: this.tags,
      metadata: this.metadata,
      graph: this.graph,
    };

    return newRecord;
  }
}

/**
 * Converts values defined in notebook document into a Reactor Record
 */
export class ReactorBuilder implements RecordBuilder {
  record: ReactorRecord;

  constructor() {
    this.record = new ReactorRecord();
  }

  setMetadata(arg: any): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: any): void {
    if (ref.type === "reactor_graph") {
      this.record.graph = ref;
    }
  }

  getResult() {
    const isValid = this.record.validate();

    if (isValid) {
      return this.record.export();
    } else {
      throw new Error("Method not implemented.");
    }
  }
  reset(): void {
    this.record = new ReactorRecord();
  }
}
