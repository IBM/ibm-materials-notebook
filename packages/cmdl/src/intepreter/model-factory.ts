import { ComponentModel } from "./component-model";
import { ReferenceGroupModel } from "./reference-group-model";
import { Complex } from "./complex-model";
import { FlowReaction } from "./flow-model";
import { Solution } from "./solution-model";
import { ModelActivationRecord } from "./model-AR";
import { PolymerGraphModel } from "./polymer-graph-model";
import { Polymer } from "./polymer-model";
import { ReactionModel } from "./reaction-model";
import { Reactor } from "./reactor-model";
import { CharDataModel } from "./characterization-model";
import { ModelType } from "cmdl-types";
import { GroupModel } from "./group-model";
import { BaseModel } from "./base-model";

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
    modelAR: ModelActivationRecord,
    path?: string[]
  ): BaseModel {
    switch (type) {
      case ModelType.REFERENCE_GROUP:
        return new ReferenceGroupModel(name, modelAR, type, path);
      case ModelType.GROUP:
      case ModelType.FRAGMENT:
      case ModelType.CHEMICAL:
        return new GroupModel(name, modelAR, type);
      case ModelType.POLYMER:
        return new Polymer(name, modelAR, type);
      case ModelType.REACTION:
        return new ReactionModel(name, modelAR, type);
      case ModelType.CHAR_DATA:
        return new CharDataModel(name, modelAR, type);
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
        return new PolymerGraphModel(name, modelAR, type);
      case ModelType.COMPLEX:
        return new Complex(name, modelAR, type);
      default:
        throw new Error(`No model is defined for ${type}!`);
    }
  }
}
