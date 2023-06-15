import { CMDLTypes } from "cmdl";
import { BaseRecord, ExperimentMetadata, RecordBuilder } from "./base-builder";
import { RecordBase } from "./exp-builder";

export interface FlowRecord extends RecordBase {
  solutions: CMDLTypes.TYPES.SolutionReference[];
  reactor?: CMDLTypes.TYPES.FlowReactor;
  runs: CMDLTypes.TYPES.FlowRxn[];
}

/**
 * Builds a record for a notebook document defining a continuous-flow experiment
 */
class FlowExperimentRecord extends BaseRecord {
  date?: string;
  metadata?: ExperimentMetadata;
  solutions: CMDLTypes.TYPES.Solution[] = [];
  reactor?: CMDLTypes.TYPES.FlowReactor;
  runs: CMDLTypes.TYPES.FlowRxn[] = [];
  samples: CMDLTypes.TYPES.SampleResult[] = [];
  charData: CMDLTypes.TYPES.CharOutput[] = [];
  sources: CMDLTypes.TYPES.RecordSource[] = [];

  setReference(arg: any): void {
    if (this.references[arg.name]) {
      throw new Error(`Reference ${arg.name} already exists!`);
    } else {
      this.references[arg.name] = arg;
    }
  }

  setMetadata(arg: CMDLTypes.TYPES.MetaData): void {
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

  export(): FlowRecord {
    const solutions: CMDLTypes.TYPES.Solution[] = this.solutions.map((el) => {
      return {
        name: el.name,
        type: el.type,
        components: el.components,
      };
    });

    //extract products from reactions
    let products: CMDLTypes.TYPES.Product[] = [];
    for (const run of this.runs) {
      products = products.concat(run.products);
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
      samples: this.samples,
      charData: this.charData,
      sources: this.sources,
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

  setMetadata(arg: CMDLTypes.TYPES.MetaData): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: CMDLTypes.TYPES.RecordRefs): void {
    if (ref.type === CMDLTypes.ModelType.FLOW_REACTION) {
      this.record.runs.push(ref);
    }

    if (ref.type === CMDLTypes.ModelType.REACTOR_GRAPH) {
      this.record.reactor = ref;
    }

    if (ref.type === CMDLTypes.ModelType.SOLUTION) {
      this.record.solutions.push(ref);
    }

    if (ref.type === CMDLTypes.ModelType.SAMPLE) {
      this.record.samples = this.record.samples.concat(ref.results);
      this.record.charData = this.record.charData.concat(ref.charData);
    }

    if (ref.type === CMDLTypes.ModelType.CHEMICAL) {
      this.record.setReference(ref);
    }
  }

  getResult(): FlowRecord {
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
