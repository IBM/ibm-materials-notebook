import { ReactorContainer } from "../reactor";
import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { CMDLReactor, CMDLReactorNode } from "../reactor/reactor-container";

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
        if (node.type === "reactor" && "nodes" in node) {
          this.container.addReactor(node);
        } else if (node.type === "component" && "target" in node) {
          this.container.addNode(node);
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
