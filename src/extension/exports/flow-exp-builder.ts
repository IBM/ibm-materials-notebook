import { BaseRecord, ExperimentMetadata, RecordBuilder } from "./base-builder";

/**
 * Builds a record for a notebook document defining a continuous-flow experiment
 */
class FlowExperimentRecord extends BaseRecord {
  date?: string;
  metadata?: ExperimentMetadata;
  solutions: any[] = [];
  reactor?: any;
  runs: any[] = [];
  samples: any[] = [];
  charData: any[] = [];

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
    const solutions = this.solutions.map((el) => {
      return {
        name: el.name,
        components: el.components,
      };
    });

    //extract products from reactions
    let products: any[] = [];
    for (const run of this.runs) {
      products = products.concat(run.products);
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

    return {
      title: this.title,
      date: this.date,
      tags: this.tags,
      metadata: this.metadata,
      solutions: solutions,
      runs: this.runs,
      results: {
        inputs: inputs,
        outputs: outputs,
      },
      references: Object.values(this.references),
      samples: newSamples,
      charData: this.charData,
    };
  }
}

/**
 * Converts values defined in notebook document into a Continuous-Flow Record
 */
export class FlowExperimentBuilder implements RecordBuilder {
  record: FlowExperimentRecord;

  constructor() {
    this.record = new FlowExperimentRecord();
  }

  setMetadata(arg: any): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: any): void {
    if (ref.type === "flow_reaction") {
      this.record.runs.push(ref);
    }

    if (ref.type === "reactor_graph") {
      this.record.reactor = ref;
    }

    if (ref.type === "solution") {
      this.record.solutions.push(ref);
    }

    if (ref.type === "sample") {
      this.record.samples = this.record.samples.concat(ref.results);
      this.record.charData = this.record.charData.concat(ref.charData);
    }

    if (ref.type === "chemical") {
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
    this.record = new FlowExperimentRecord();
  }
}
