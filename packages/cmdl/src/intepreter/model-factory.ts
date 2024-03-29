import { ComponentModel } from "./models/component-model";
import { ReferenceGroupModel } from "./models/reference-group";
import { Complex } from "./models/complex-model";
import { FlowReaction } from "./models/flow-model";
import { Solution } from "./models/solution";
import { ActivationRecord } from "./model-AR";
import { PolymerGraph } from "./models/polymer-graph-model";
import { Polymer } from "./models/polymer-model";
import { Reaction } from "./models/reaction-model";
import { Reactor } from "./models/reactor";
import { CharData } from "./models/characterization-model";
import { ModelType } from "../cmdl-types";
import { GroupModel } from "./models/group-model";
import { BaseModel } from "./models/base-model";

/**
 * Factory class to create models based on record tree node type
 * TODO: change to model builder factory
 */
export class ModelFactory {
  /**
   * Creates a model for handling properties and values of different CMDL groups
   * @param name string
   * @param type string
   * @param modelAR ModelActivationRecord
   * @param path string[] | undefined
   * @returns BaseModel
   */
  static createModel(
    name: string,
    type: string,
    modelAR: ActivationRecord,
    path?: string[]
  ): BaseModel {
    switch (type) {
      case ModelType.REFERENCE_GROUP:
        return new ReferenceGroupModel(name, modelAR, type, path);
      case ModelType.GROUP:
      case ModelType.FRAGMENTS:
        return new GroupModel(name, modelAR, type);
      case ModelType.CHEMICAL:
        return new GroupModel(name, modelAR, type);
      case ModelType.POLYMER:
        return new Polymer(name, modelAR, type);
      case ModelType.REACTION:
        return new Reaction(name, modelAR, type);
      case ModelType.CHAR_DATA:
        return new CharData(name, modelAR, type);
      case ModelType.SOLUTION:
        return new Solution(name, modelAR, type);
      case ModelType.CONTAINER:
      case ModelType.COMPONENT:
      case ModelType.REACTOR:
        return new ComponentModel(name, modelAR, type);
      case ModelType.REACTOR_GRAPH:
        return new Reactor(name, modelAR, type);
      case ModelType.FLOW_REACTION:
        return new FlowReaction(name, modelAR, type);
      case ModelType.POLYMER_GRAPH:
        return new PolymerGraph(name, modelAR, type);
      case ModelType.COMPLEX:
        return new Complex(name, modelAR, type);
      default:
        throw new Error(`No model is defined for ${type}!`);
    }
  }

  // builder function for generic groups
}
