import { ExportStrategy } from "./base-template";
import { Entity } from "../intepreter";
import { ReactionEntity, ResultEntity } from "../intepreter/entities";

export class ProtocolProductStrategy implements ExportStrategy {
  protocol?: string;
  product?: string;
  structure?: string;
  charData?: string[][] = [];

  private extractReaction(model: ReactionEntity) {
    const reactionData = model.export();
    this.protocol = reactionData.protocol || "";
    this.product = reactionData.products[0].name;
  }

  private extractResult(model: ResultEntity) {
    const resultData = model.protocolExport();
    this.structure = resultData.structure;
    this.charData = resultData?.charData ? [...resultData.charData.data] : [];
  }

  compile(modelArr: Entity<unknown>[]) {
    for (const model of modelArr) {
      if (model instanceof ReactionEntity) {
        this.extractReaction(model);
      } else if (model instanceof ResultEntity) {
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
