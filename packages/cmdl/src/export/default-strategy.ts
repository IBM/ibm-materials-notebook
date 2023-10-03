import { TYPES } from "cmdl-types";
import { ExportStrategy } from "./base-template";
import { Model } from "../intepreter";
import {
  CharDataModel,
  CharFileReader,
  ChemicalModel,
  ComplexModel,
  PolymerGraphModel,
  PolymerModel,
  ProtocolModel,
  ReactionModel,
  ReactorModel,
  ResultModel,
} from "../intepreter/models";
import { logger } from "../logger";

interface RecordMetadata {
  date?: string;
  notebookId?: string;
  record_id?: string;
}

type EntityModels =
  | ChemicalModel
  | PolymerModel
  | ReactorModel
  | ComplexModel
  | PolymerGraphModel;

export class DefaultExport implements ExportStrategy {
  title?: string;
  tags: string[] = [];
  metadata?: RecordMetadata;
  entities: any[] = [];
  reactions: TYPES.Reaction[] = [];
  flowReactions: any[] = [];
  solutions: any[] = [];
  results: any[] = [];
  charData: any[] = [];
  files: any[] = [];
  protocols: any[] = [];

  private processMetadata(model: Model<TYPES.MetaData>) {
    if (this.metadata) {
      //should only have one metadata group per doc
      return;
    }

    const metadata = model.export();

    const recordMetadata: RecordMetadata = {
      record_id: metadata.record_id,
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

  private processReaction(rxn: ReactionModel) {
    const rxnData = rxn.export();
    this.reactions.push(rxnData);
  }

  private processSolution(soln: any[]) {}
  private processFlowReactions(flowRxns: any[]) {}
  private processResult(result: ResultModel) {
    const resultData = result.export();
    this.results.push(resultData);
  }
  private processProtocols(protocol: ProtocolModel) {
    const data = protocol.export();
    this.protocols.push(data);
  }
  private processCharData(charData: CharDataModel) {
    const data = charData.export();
    this.charData.push(data);
  }
  private processFiles(file: CharFileReader) {
    const data = file.export();
    this.files.push(data);
  }

  public compile(modelArr: Model<unknown>[]): any {
    for (const model of modelArr) {
      if (
        model instanceof ChemicalModel ||
        model instanceof ReactorModel ||
        model instanceof PolymerModel ||
        model instanceof PolymerGraphModel ||
        model instanceof ComplexModel
      ) {
        this.processEntity(model);
      } else if (model instanceof ReactionModel) {
        this.processReaction(model);
      } else if (model instanceof ResultModel) {
        this.processResult(model);
      } else if (model instanceof CharDataModel) {
        this.processCharData(model);
      } else if (model instanceof ProtocolModel) {
        this.processProtocols(model);
      } else if (model instanceof CharFileReader) {
        this.processFiles(model);
      } else if (model.name === "metadata") {
        this.processMetadata(model as Model<TYPES.MetaData>);
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
      flowReactions: this.flowReactions,
      solutions: this.solutions,
      results: this.results,
      charData: this.charData,
      files: this.files,
      protocols: this.protocols,
    };
  }
}
