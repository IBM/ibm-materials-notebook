import { BaseRecord, RecordBuilder, ExperimentMetadata } from "./base-builder";

export interface Results {
  inputs: any[];
  outputs: any[];
}

/**
 * Builds a record for a notebook document defining a batch reaction experiment
 */
class ExperimentRecord extends BaseRecord {
  date?: string;
  metadata?: ExperimentMetadata;
  reactions: any[] = [];
  samples: any[] = [];
  charData: any[] = [];
  sources: any[] = [];

  setReference(arg: any): void {
    if (this.references[arg.name]) {
      throw new Error(`Reference ${arg.name} already exists!`);
    } else {
      this.references[arg.name] = arg;
    }
  }

  setMetadata(arg: any): void {
    this.title = arg.title;
    this.date = arg.date;
    this.tags = arg.tags;
    this.sources.push(arg.source);
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

  export(): any {
    //extract products from reactions
    let products: any[] = [];
    for (const reaction of this.reactions) {
      products = products.concat(reaction.products);
    }

    //extract sample results merge and create results
    let outputs = [];
    let inputs = [];

    for (const result of this.samples) {
      let product = products.find((el) => el.name === result.name);

      if (product) {
        let newResult: Record<string, any> = {};
        for (const [key, value] of Object.entries(result)) {
          if (key !== "properties") {
            newResult[key] = value;
          }
        }
        outputs.push(newResult);
      } else {
        inputs.push(result);
      }
    }

    let newSamples = this.samples.map((el) => {
      return {
        name: el.name,
        sampleId: el.sampleId,
        timePoint: el.timePoint,
        properties: el.properties,
      };
    });

    const newReactions = this.reactions.map((el) => {
      return {
        ...el,
        type: undefined,
      };
    });

    return {
      title: this.title,
      tags: this.tags,
      date: this.date,
      metadata: this.metadata,
      reactions: newReactions,
      references: Object.values(this.references),
      samples: newSamples,
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

  setReferences(ref: any): void {
    if (ref.type === "reaction") {
      this.record.reactions.push(ref);
    }

    if (ref.type === "sample") {
      this.record.samples = this.record.samples.concat(ref.results);
      this.record.charData = this.record.charData.concat(ref.charData);
    }

    if (ref.type === "chemical" || ref.type === "polymer") {
      this.record.setReference(ref);
    }
  }

  getResult() {
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
