import {
  AngleProperty,
  GeneralGroup,
  NamedGroup,
  RecordNode,
  ReferenceGroup,
  RefListProperty,
  RefProperty,
} from "../../cmdl-tree/components";
import { AstVisitor } from "../symbols/symbol-table";
import { ModelFactory } from "./model-factory";
import { ModelActivationRecord } from "./model-AR";
import { CmdlStack } from "../cmdl-stack";
import { cmdlLogger as logger } from "../../logger";
import { Property } from "../../cmdl-tree/components/base-components";
import { typeManager } from "../../cmdl-types";
import { ModelType } from "../../cmdl-types/groups/group-types";
import { ImportOp } from "../../cmdl-tree/components/import-group";

/**
 * Visits record tree and executes different models on elements
 */
export class ModelVisitor implements AstVisitor {
  uri: string;
  private modelStack = new CmdlStack<ModelActivationRecord>();

  constructor(globalAR: ModelActivationRecord, uri: string) {
    this.modelStack.push(globalAR);
    this.uri = uri;
  }

  /**
   * Top level function to initiate the traversal process
   * @param arg RecordNode
   */
  visit(arg: RecordNode): void {
    arg.accept(this);
  }

  /**
   * Visits a NamedGroup and creates a model and model activation record based on its type.
   * The model is then executed following traversal of the node's children. Results are written to parent AR.
   * @param node NamedGroup
   */
  visitModelNode(node: NamedGroup) {
    const modelType = typeManager.getModel(node.name);
    const modelAR = new ModelActivationRecord(modelType, node.name, this.uri);

    this.modelStack.push(modelAR);

    const model = ModelFactory.createModel(node.identifier, modelType, modelAR);

    for (const child of node.children) {
      this.visit(child);
    }

    this.modelStack.pop();
    model.execute(this.modelStack.peek());
  }

  /**
   * Writes property values to the current AR.
   * @param node Property
   */
  visitProperty(node: Property) {
    const values = node.getValues();
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, values);
  }

  /**
   * Creates a model and model AR, traverses node children, and then executes the model.
   * Results are written to parent AR.
   * @param node ReferenceGroup
   */
  visitReferenceGroup(node: ReferenceGroup) {
    logger.verbose(`Starting model execution for reference ${node.name}`);

    const path = node.getPath();

    const modelAR = new ModelActivationRecord(
      ModelType.REFERENCE_GROUP,
      node.name,
      this.uri
    );

    this.modelStack.push(modelAR);

    const model = ModelFactory.createModel(
      node.name,
      ModelType.REFERENCE_GROUP,
      modelAR,
      path
    );

    for (const child of node.children) {
      this.visit(child);
    }

    this.modelStack.pop();
    model.execute(this.modelStack.peek());
    logger.verbose(`...finished model execution for ${node.name}`);
  }

  /**
   * Writes reference property values to current AR.
   * @param node RefProperty
   */
  visitReferenceProperty(node: RefProperty) {
    const ref = node.getValues().slice(1);
    const path = node.getPath();
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, { ref, path });
  }

  /**
   * Writes reference list property values to current AR.
   * @param node RefListProperty
   */
  visitReferenceListProperty(node: RefListProperty) {
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, node.export());
  }

  /**
   * Writes current angle property values to current AR.
   * @param node AngleProperty
   */
  visitAngleProperty(node: AngleProperty) {
    const currentAR = this.modelStack.peek();
    currentAR.mergeArrayValue("connections", node.export());
  }

  /**
   * Creates a group model, visits children, and tablulates values on current AR.
   * @param node GeneralGroup
   */
  visitGeneralGroup(node: GeneralGroup) {
    logger.verbose(`Starting model execution for group ${node.name}`);

    const modelAR = new ModelActivationRecord(
      ModelType.GROUP,
      node.name,
      this.uri
    );

    this.modelStack.push(modelAR);

    const model = ModelFactory.createModel(node.name, ModelType.GROUP, modelAR);

    for (const child of node.children) {
      this.visit(child);
    }

    this.modelStack.pop();
    model.execute(this.modelStack.peek());
    logger.verbose(`...finished group model execution for ${node.name}`);
  }

  visitImportOp(node: ImportOp) {
    logger.verbose(`Starting model execution for import ${node.name}`);
    const nodeName = node.aliasToken ? node.aliasToken.image : node.name;

    const modelType = node.getImportType();
    const modelAR = new ModelActivationRecord(modelType, nodeName, this.uri);

    const sourceData = node.export();

    for (const [key, value] of Object.entries(sourceData)) {
      modelAR.setValue(key, value);
    }

    const model = ModelFactory.createModel(nodeName, modelType, modelAR);
    model.execute(this.modelStack.peek());
    logger.verbose(`...finished group model execution for ${nodeName}`);
  }
}
