import { ExportStrategy } from "./base-template";
import { Model } from "../intepreter";
import {
  CharDataModel,
  PolymerModel,
  ReactionModel,
  ResultModel,
} from "../intepreter/models";
import { logger } from "../logger";

export class ProtocolProductStrategy implements ExportStrategy {
  protocol?: string;
  product?: string;
  structure?: string;
  charData?: string[][] = [];

  private extractReaction(model: ReactionModel) {
    const reactionData = model.export();
    this.protocol = reactionData.protocol || "";
    this.product = reactionData.products[0].name;
  }

  private extractResult(model: ResultModel) {
    const resultData = model.protocolExport();
    this.structure = resultData.structure;
    this.charData = resultData?.charData ? [...resultData.charData.data] : [];
  }

  compile(modelArr: Model<unknown>[]) {
    for (const model of modelArr) {
      if (model instanceof ReactionModel) {
        this.extractReaction(model);
      } else if (model instanceof ResultModel) {
        this.extractResult(model);
      }
    }

    return {
      protocol: this.protocol,
      structure: this.structure,
      product: this.product,
      charData: this.charData
        ? `[${this.charData.map((el) => `[${el.join(",")}]`).join(",")}]`
        : null,
    };
  }
}
