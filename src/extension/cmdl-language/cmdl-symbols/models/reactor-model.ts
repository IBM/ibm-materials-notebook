import { cmdlLogger as logger } from "../../logger";
import { ReactorContainer } from "../reactor";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";

export class Reactor extends BaseModel {
  private container = new ReactorContainer();

  constructor(name: string, modelAR: ModelActivationRecord, type: string) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
    logger.debug(`Executing reactor ${this.name}:\n${this.modelAR.print()}`);

    const outputNode = this.modelAR.getOptionalValue("outputNode");

    if (outputNode) {
      const properties: Record<string, any> = {
        name: this.name,
        type: this.type,
      };

      for (const [name, value] of this.modelAR.all()) {
        properties[name] = value;
      }

      globalAR.setValue(this.name, properties);
    } else {
      const nodes = this.modelAR.getValue("nodes");

      for (const node of nodes) {
        if (node.type === "component") {
          this.container.addNode(node);
        } else if (node.type === "reactor") {
          this.container.addReactor(node);
        } else {
          throw new Error(
            `Unrecognized node type for reactor graph: ${node.name} ${node.type}`
          );
        }
      }

      this.container.linkNodeGraph();
      const reactor = this.container.serialize();
      globalAR.setValue(this.name, {
        name: this.name,
        type: this.type,
        ...reactor,
      });
    }
  }
}
