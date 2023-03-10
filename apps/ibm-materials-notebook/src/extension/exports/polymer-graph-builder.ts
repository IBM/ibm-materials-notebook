import { BaseRecord, RecordBuilder } from "./base-builder";

/**
 * Builds a record for a notebook document defining a polymer graph
 * @deprecated
 */
export class PolymerGraphRecord extends BaseRecord {
  name?: string;
  graph?: Record<string, any>;
  str?: string;
  maskedStr?: string;
  compressedStr?: string;
  tree?: Record<string, any>;

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
      str: this.str,
      maskedStr: this.maskedStr,
      compressedStr: this.compressedStr,
      graph: this.graph,
      tree: this.tree,
      references: this.references,
    };

    return newRecord;
  }
}

/**
 * Converts values defined in notebook document into a Polymer Graph Record
 */
export class PolymerGraphBuilder implements RecordBuilder {
  record: PolymerGraphRecord;

  constructor() {
    this.record = new PolymerGraphRecord();
  }

  setMetadata(arg: any): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: any): void {
    if (ref.type === "polymer_graph") {
      this.record.graph = ref.graph;
      this.record.tree = ref.tree;
      this.record.maskedStr = ref.maskedStr;
      this.record.compressedStr = ref.compressedStr;
      this.record.str = ref.str;
    }

    if (ref.type === "fragment") {
      this.record.setReference(ref);
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
    this.record = new PolymerGraphRecord();
  }
}
