import { ModelActivationRecord } from "./model-AR";
import { BaseModel } from "./base-model";
import { ModelType, TYPES } from "cmdl-types";
import { ReactorContainer } from "cmdl-reactors";

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
    //! update code for import resolution
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
        this.modelAR.getValue<(TYPES.ReactorNode | TYPES.Reactor)[]>("nodes");

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
