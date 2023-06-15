import { logger } from "../../logger";
import { ITemplates, TEMPLATES, CMDL, typeManager } from "cmdl";
import { RecordBuilder } from "./base-builder";
import { ExpRecord, ExperimentBuilder } from "./exp-builder";
import { FlowExperimentBuilder, FlowRecord } from "./flow-exp-builder";
// import {
//   CMDLMetaData,
//   CMDLRecordTypes,
// } from "../cmdl-language/cmdl-symbols/symbol-types";

/**
 * Manages building of record objects to write to JSON
 */
export class RecordDirector {
  private template?: ITemplates;
  private recordBuilder?: RecordBuilder;

  /**
   * Builds a record output to be written to a JSON file
   * @param metadata CMDLMetaData defined metadata from a notebook document
   * @param values CMDLRecordTypes[]
   * @returns any
   */
  build(
    metadata: CMDLMetaData,
    values: CMDLRecordTypes[]
  ): FlowRecord | ExpRecord | undefined {
    try {
      const template = typeManager.getTempate(metadata.template);

      if (!template) {
        throw new Error(`${metadata.template} was not found in templates repo`);
      }
      this.template = template;

      if (
        this.template.name === TEMPLATES.FRAGMENT ||
        this.template.name === TEMPLATES.SMALL_MOLECULE ||
        this.template.name === TEMPLATES.MATERIAL
      ) {
        throw new Error(
          `Export templates for fragment, small-molecule, materials are now deprecated!`
        );
      } else if (this.template.name === TEMPLATES.BATCH_EXPERIMENT) {
        this.recordBuilder = new ExperimentBuilder();
      } else if (this.template.name === TEMPLATES.FLOW_EXPERIMENT) {
        this.recordBuilder = new FlowExperimentBuilder();
      } else if (this.template.name === TEMPLATES.POLYMER_GRAPH) {
        // this.recordBuilder = new PolymerGraphBuilder();
        throw new Error(`Export template for polymer graph is now deprecated!`);
      } else if (this.template.name === TEMPLATES.REACTOR) {
        // this.recordBuilder = new ReactorBuilder();
        throw new Error(`Export template for reactor is now deprecated!`);
      } else {
        throw new Error(
          `template ${this.template.name} has no record handler!`
        );
      }

      this.recordBuilder.setMetadata(metadata);
      for (const value of values) {
        if (value.name === "metadata") {
          continue;
        } else {
          this.recordBuilder?.setReferences(value);
        }
      }
      return this.recordBuilder.getResult();
    } catch (error) {
      logger.error((error as Error).message);
    }
  }
}
