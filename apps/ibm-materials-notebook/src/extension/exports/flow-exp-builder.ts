import {
  CMDLFlowRxn,
  CMDLRxnProduct,
} from "../cmdl-language/cmdl-symbols/models/flow-model";
import { CMDLFlowReactor } from "../cmdl-language/cmdl-symbols/models/reactor-model";
import {
  CMDLCharOutput,
  CMDLSampleResult,
} from "../cmdl-language/cmdl-symbols/models/sample-model";
import {
  CMDLSolution,
  CMDLSolutionExport,
} from "../cmdl-language/cmdl-symbols/models/solution-model";
import {
  CMDLMetaData,
  CMDLRecordRefs,
  CMDLRecordSource,
} from "../cmdl-language/cmdl-symbols/symbol-types";
import { ModelType } from "../cmdl-language/cmdl-types/groups/group-types";
import { BaseRecord, ExperimentMetadata, RecordBuilder } from "./base-builder";
import { RecordBase } from "./exp-builder";

interface FlowRecord extends RecordBase {
  solutions: CMDLSolutionExport[];
  reactor?: CMDLFlowReactor;
  runs: CMDLFlowRxn[];
}

/**
 * Builds a record for a notebook document defining a continuous-flow experiment
 */
class FlowExperimentRecord extends BaseRecord {
  date?: string;
  metadata?: ExperimentMetadata;
  solutions: CMDLSolution[] = [];
  reactor?: CMDLFlowReactor;
  runs: CMDLFlowRxn[] = [];
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

  export(): FlowRecord {
    const solutions: CMDLSolutionExport[] = this.solutions.map((el) => {
      return {
        name: el.name,
        type: el.type,
        components: el.components,
      };
    });

    //extract products from reactions
    let products: CMDLRxnProduct[] = [];
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

  setMetadata(arg: CMDLMetaData): void {
    this.record.setMetadata(arg);
  }

  setReferences(ref: CMDLRecordRefs): void {
    if (ref.type === ModelType.FLOW_REACTION) {
      this.record.runs.push(ref);
    }

    if (ref.type === ModelType.REACTOR_GRAPH) {
      this.record.reactor = ref;
    }

    if (ref.type === ModelType.SOLUTION) {
      this.record.solutions.push(ref);
    }

    if (ref.type === ModelType.SAMPLE) {
      this.record.samples = this.record.samples.concat(ref.results);
      this.record.charData = this.record.charData.concat(ref.charData);
    }

    if (ref.type === ModelType.CHEMICAL) {
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
