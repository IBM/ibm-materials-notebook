import {
  AngleProperty,
  GeneralGroup,
  NamedGroup,
  RecordNode,
  ReferenceGroup,
  RefListProperty,
  RefProperty,
  Property,
  ImportOp,
  ImportFileOp,
  ProtocolGroup,
  AssignmentProperty,
} from "../cmdl-tree";
import path from "path";
import { AstVisitor } from "../symbols";
import { ModelFactory } from "./model-factory";
import { ModelActivationRecord } from "./model-AR";
import { CmdlStack } from "../cmdl-stack";
import { logger } from "../logger";
import { typeManager, ModelType } from "cmdl-types";
import { Controller } from "../controller";
import { Clonable, CharFileReader, ProtocolModel } from "./models";

/**
 * Visits record tree and executes different models on elements
 */
export class ModelVisitor implements AstVisitor {
  uri: string;
  private readonly controller: Controller;
  private modelStack = new CmdlStack<ModelActivationRecord>();

  constructor(
    globalAR: ModelActivationRecord,
    uri: string,
    controller: Controller
  ) {
    this.modelStack.push(globalAR);
    this.uri = uri;
    this.controller = controller;
  }

  /**
   * Top level function to initiate the traversal process
   * @param arg RecordNode
   */
  public visit(arg: RecordNode): void {
    arg.accept(this);
  }

  /**
   * Visits a NamedGroup and creates a model and model activation record based on its type.
   * The model is then executed following traversal of the node's children. Results are written to parent AR.
   * @param node NamedGroup
   */
  public visitModelNode(node: NamedGroup): void {
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
  public visitProperty(node: Property): void {
    const values = node.getValues();
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, values);
  }

  /**
   * Creates a model and model AR, traverses node children, and then executes the model.
   * Results are written to parent AR.
   * @param node ReferenceGroup
   */
  public visitReferenceGroup(node: ReferenceGroup): void {
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
  public visitReferenceProperty(node: RefProperty): void {
    const ref = node.getValues().slice(1);
    const path = node.getPath();
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, { ref, path });
  }

  /**
   * Writes reference list property values to current AR.
   * @param node RefListProperty
   */
  public visitReferenceListProperty(node: RefListProperty): void {
    const currentAR = this.modelStack.peek();
    currentAR.setValue(node.name, node.export());
  }

  /**
   * Writes current angle property values to current AR.
   * @param node AngleProperty
   */
  public visitAngleProperty(node: AngleProperty): void {
    const currentAR = this.modelStack.peek();
    currentAR.mergeArrayValue("connections", node.export());
  }

  /**
   * Creates a group model, visits children, and tablulates values on current AR.
   * @param node GeneralGroup
   */
  public visitGeneralGroup(node: GeneralGroup): void {
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

  /**
   * Visits a import operation node in the AST. Imports values for the given
   * entitiy in to the current AR
   * @todo clone class in memory for model
   * @param node ImportOp
   */
  public visitImportOp(node: ImportOp): void {
    logger.verbose(`Starting model execution for import ${node.name}`);
    const nodeName = node.aliasToken ? node.aliasToken.image : node.name;

    const sourceNamespace = path.basename(node.source);
    const namespaceManager = this.controller.getNamespaceAR(sourceNamespace);
    const sourceSymbols = this.controller.getSymbolTable(sourceNamespace);

    try {
      sourceSymbols.get(node.name);
    } catch (error) {
      logger.warn(`No symbol found for ${node.name}, searching for results...`);
    }

    let values = namespaceManager.getOptionalValue<Clonable>(node.name);

    if (!values) {
      try {
        this.controller.executeNamespace(sourceNamespace);
        values = namespaceManager.getValue<Clonable>(node.name);
      } catch (error) {
        logger.error(`Encountered error during import operation: ${error}`);
        throw new Error(`Unable to import ${node.name} from ${node.source}`);
      }
    }

    const globalAR = this.modelStack.peek();
    globalAR.setValue(nodeName, values.clone());
  }

  public visitImportFileOp(node: ImportFileOp): void {
    const fileModel = new CharFileReader(node.source);
    fileModel.processFileData();

    logger.verbose(`processed file data`, { meta: fileModel.data });

    const globalAR = this.modelStack.peek();
    globalAR.setValue(node.name, fileModel);
  }

  public visitAssignmentProp(prop: AssignmentProperty) {
    const currentAR = this.modelStack.peek();
    currentAR.mergeArrayValue("fragments", {
      name: prop.name,
      value: prop.getValues(),
    });
  }

  public visitProtocolGroup(group: ProtocolGroup): void {
    const protocolModel = new ProtocolModel(group.identifier, "protocol");
    const { protocol, references } = group.export();
    protocolModel.initializeProtocol(protocol, references);

    const globalAR = this.modelStack.peek();
    globalAR.setValue(group.identifier, protocolModel);
  }
}
