import { ReactorContainer } from "../reactor";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType } from "cmdl-types";
import {
  CMDLReactor,
  CMDLReactorNode,
  SerializedReactor,
} from "../reactor/reactor-container";

export type CMDLFlowReactor = SerializedReactor & {
  name: string;
  type: ModelType.REACTOR_GRAPH;
};

export class Reactor extends BaseModel {
  private container = new ReactorContainer();

  constructor(
    name: string,
    modelAR: ModelActivationRecord,
    type: ModelType.REACTOR_GRAPH
  ) {
    super(name, modelAR, type);
  }

  public execute(globalAR: ModelActivationRecord): void {
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
      const nodes =
        this.modelAR.getValue<(CMDLReactorNode | CMDLReactor)[]>("nodes");

      for (const node of nodes) {
        if (node.type === "reactor") {
          this.container.addReactor(node);
        } else if (node.type === "component") {
          this.container.addNode(node);
        } else {
          throw new Error(`Unrecognized node type for reactor graph`);
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
