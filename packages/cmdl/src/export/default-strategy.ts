import { TYPES } from "@ibm-materials/cmdl-types";
import { ExportStrategy } from "./base-template";
import { Entity } from "../intepreter";
import {
  CharDataModel,
  CharFileReader,
  ChemicalEntity,
  ComplexEntity,
  PolymerGraphEntity,
  PolymerEntity,
  ReactionEntity,
  ReactorEntity,
  ResultEntity,
} from "../intepreter/entities";
import { logger } from "../logger";

interface RecordMetadata {
  date?: string;
  notebookId?: string;
  record_id?: string;
}

type EntityModels =
  | ChemicalEntity
  | PolymerEntity
  | ReactorEntity
  | ComplexEntity
  | PolymerGraphEntity;

export class DefaultExport implements ExportStrategy {
  title?: string;
  tags: string[] = [];
  metadata?: RecordMetadata; //? expand meta data
  entities: unknown[] = [];
  reactions: any[] = [];
  results: any[] = [];
  charData: any[] = [];
  files: { fileName: string; data: string[][] }[] = [];

  private processMetadata(model: Entity<TYPES.MetaData>) {
    if (this.metadata) {
      //should only have one metadata group per doc
      return;
    }

    const metadata = model.export();

    const recordMetadata: RecordMetadata = {
      date: metadata.date,
      notebookId: metadata.notebookId,
    };
    this.metadata = recordMetadata;
    this.title = metadata.title;

    if (metadata.tags) {
      this.tags = metadata.tags;
    }
  }

  private processEntity(model: EntityModels): void {
    const modelData = model.export();
    this.entities.push(modelData);
  }

  private processReaction(rxn: ReactionEntity) {
    const rxnData = rxn.export();
    this.reactions.push(rxnData);
  }

  private processResult(result: ResultEntity) {
    const resultData = result.export();
    this.results.push(resultData);
  }
  private processCharData(charData: CharDataModel) {
    const data = charData.export();
    this.charData.push(data);
  }
  private processFiles(file: CharFileReader) {
    const data = file.export();
    this.files.push(data);
  }

  public compile(modelArr: Entity<unknown>[]) {
    for (const model of modelArr) {
      if (
        model instanceof ChemicalEntity ||
        model instanceof ReactorEntity ||
        model instanceof PolymerEntity ||
        model instanceof PolymerGraphEntity ||
        model instanceof ComplexEntity
      ) {
        this.processEntity(model);
      } else if (model instanceof ReactionEntity) {
        this.processReaction(model);
      } else if (model instanceof ResultEntity) {
        this.processResult(model);
      } else if (model instanceof CharDataModel) {
        this.processCharData(model);
      } else if (model instanceof CharFileReader) {
        this.processFiles(model);
      } else if (model.name === "metadata") {
        this.processMetadata(model as Entity<TYPES.MetaData>);
      } else {
        logger.verbose(`skipping model: ${model.name}, ${model.type}`);
      }
    }
    return {
      title: this.title,
      tags: this.tags,
      metadata: this.metadata,
      entities: this.entities,
      reactions: this.reactions,
      results: this.results,
      charData: this.charData,
      files: this.files,
    };
  }
}
