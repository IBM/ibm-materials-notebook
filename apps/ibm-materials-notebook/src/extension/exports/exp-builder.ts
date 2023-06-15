// import { CMDLRxnProduct } from "../cmdl-language/cmdl-symbols/models/flow-model";
// import { CMDLReaction } from "../cmdl-language/cmdl-symbols/models/reaction-model";
// import {
//   CMDLCharOutput,
//   CMDLSampleResult,
// } from "../cmdl-language/cmdl-symbols/models/sample-model";
// import {
//   CMDLMetaData,
//   CMDLRecordRefs,
//   CMDLRecordSource,
// } from "../cmdl-language/cmdl-symbols/symbol-types";
import { TAGS, TYPES, ModelType } from "cmdl";
import { BaseRecord, RecordBuilder, ExperimentMetadata } from "./base-builder";

export interface Results {
  inputs: CMDLSampleResult[];
  outputs: CMDLSampleResult[];
}

export interface RecordBase {
  title?: string;
  date?: string;
  tags?: TAGS[];
  metadata?: ExperimentMetadata;
  samples: CMDLSampleResult[];
  charData: CMDLCharOutput[];
  sources: CMDLRecordSource[];
  results: Results;
  references: CMDLRecordRefs[];
}

export interface ExpRecord extends RecordBase {
  reactions: CMDLReaction[];
}

/**
 * Builds a record for a notebook document defining a batch reaction experiment
 */
class ExperimentRecord extends BaseRecord {
  date?: string;
  metadata?: ExperimentMetadata;
  reactions: CMDLReaction[] = [];
  samples: CMDLSampleResult[] = [];
  charData: CMDLCharOutput[] = [];
  sources: CMDLRecordSource[] = [];

  setReference(arg: any): void {
    if (this.references[arg.name]) {
      throw new Error(`Reference ${arg.name} already exists!`);
    } else {
      this.references[arg.name] = arg;
    }
  }

  setMetadata(arg: CMDLMetaData): void {
    this.title = arg.title;
    this.date = arg.date;
    this.tags = arg.tags;

    if (arg.source) {
      this.sources.push(arg.source);
    }

    this.metadata = {
      notebookId: arg.notebookId,
      dateCreated: new Date(Date.now()).toISOString(),
      template: arg.template,
      record_id: arg.record_id,
      exp_id: arg.exp_id,
    };
  }

  validate() {
    if (!this.metadata || !this.title || !this.date) {
      return false;
    } else {
      return true;
    }
  }

  export(): ExpRecord {
    //extract products from reactions
    let products: CMDLRxnProduct[] = [];
    for (const reaction of this.reactions) {
      products = products.concat(reaction.products);
    }

    //extract sample results merge and create results
    let outputs = [];
    let inputs = [];

    for (const result of this.samples) {
      let product = products.find((el) => el.name === result.name);

      if (product) {
        outputs.push(result);
      } else {
        inputs.push(result);
      }
    }

    return {
      title: this.title,
      tags: this.tags,
      date: this.date,
      metadata: this.metadata,
      reactions: this.reactions,
      references: Object.values(this.references),
      samples: this.samples,
      results: {
        inputs: inputs,
        outputs: outputs,
      },
      charData: this.charData,
      sources: this.sources,
    };
  }
}

/**
 * Converts values defined in notebook document into a Experiment Record
 */
export class ExperimentBuilder implements RecordBuilder {
  record: ExperimentRecord;

  constructor() {
    this.record = new ExperimentRecord();
  }

  setMetadata(arg: any): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: CMDLRecordRefs): void {
    if (ref.type === ModelType.REACTION) {
      this.record.reactions.push(ref);
    }

    if (ref.type === ModelType.SAMPLE) {
      this.record.samples = this.record.samples.concat(ref.results);
      this.record.charData = this.record.charData.concat(ref.charData);
    }

    if (
      ref.type === ModelType.CHEMICAL ||
      ref.type === ModelType.POLYMER ||
      ref.type === ModelType.COMPLEX
    ) {
      this.record.setReference(ref);
    }
  }

  getResult(): ExpRecord {
    const isValid = this.record.validate();

    if (isValid) {
      return this.record.export();
    } else {
      throw new Error("Experiment record is not fully valid");
    }
  }
  reset(): void {
    this.record = new ExperimentRecord();
  }
}
