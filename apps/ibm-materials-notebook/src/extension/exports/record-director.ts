import { logger } from "../../logger";
import { typeManager } from "../cmdl-language";
import { ITemplates, TEMPLATES } from "../cmdl-language/cmdl-types/templates";
import { RecordBuilder } from "./base-builder";
import { MaterialBuilder } from "./material-builder";
import { ExperimentBuilder } from "./exp-builder";
import { FlowExperimentBuilder } from "./flow-exp-builder";
import { PolymerGraphBuilder } from "./polymer-graph-builder";
import { ReactorBuilder } from "./reactor-builder";

/**
 * Manages building of record objects to write to JSON
 */
export class RecordDirector {
  private template?: ITemplates;
  private recordBuilder?: RecordBuilder;

  /**
   * Builds a record output to be written to a JSON file
   * @param metadata any defined metadata from a notebook document
   * @param values any
   * @returns any
   */
  build(metadata: any, values: any) {
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
        this.recordBuilder = new MaterialBuilder();
      } else if (this.template.name === TEMPLATES.BATCH_EXPERIMENT) {
        this.recordBuilder = new ExperimentBuilder();
      } else if (this.template.name === TEMPLATES.FLOW_EXPERIMENT) {
        this.recordBuilder = new FlowExperimentBuilder();
      } else if (this.template.name === TEMPLATES.POLYMER_GRAPH) {
        this.recordBuilder = new PolymerGraphBuilder();
      } else if (this.template.name === TEMPLATES.REACTOR) {
        this.recordBuilder = new ReactorBuilder();
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
