import { BaseRecord, RecordBuilder } from "./base-builder";

/**
 * Builds a record for a notebook document defining a material
 */
export class MaterialRecord extends BaseRecord {
  structure?: Record<string, any>;
  properties?: Record<string, any>;

  setMetadata(arg: any): void {
    this.title = arg.title;
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
    if (!this.metadata || !this.title) {
      return false;
    } else {
      return true;
    }
  }
  export() {
    return {
      title: this.title,
      tags: this.tags,
      metadata: this.metadata,
      structure: this.structure,
      properties: this.properties,
      references: this.references,
    };
  }
}

/**
 * Converts values defined in notebook document into a Material Record
 */
export class MaterialBuilder implements RecordBuilder {
  record: MaterialRecord;

  constructor() {
    this.record = new MaterialRecord();
  }

  setMetadata(arg: any): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: any): void {
    if (ref.type === "structure") {
      this.record.structure = ref;
    }

    if (ref.type === "physical_properties") {
      this.record.properties = ref;
    }

    if (ref.type === "polymer_graph") {
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
    this.record = new MaterialRecord();
  }
}
