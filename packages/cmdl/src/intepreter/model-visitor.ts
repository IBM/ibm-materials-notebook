import {
  CMDLAssignProp,
  CMDLEdgeProp,
  CMDLGraph,
  CMDLImport,
  CMDLNode,
  CMDLProperties,
  CMDLRecord,
  CMDLReference,
} from "../cmdl-tree";
import { AstVisitor } from "../symbols";
import { ActivationRecord } from "./model-AR";
import { CmdlStack } from "../cmdl-stack";
import { CmdlCompiler } from "../cmdl-compiler";

/**
 * Visits record tree and executes different models on elements
 * TODO: clear after execution
 * TODO: DAG is final store of all data
 * TODO: simplify to build and execute models that are needed. Many operations are simply copying...
 * !Rename to interpreter
 */
export class ModelVisitor implements AstVisitor {
  uri: string;
  private readonly controller: CmdlCompiler; //?unneeded
  private modelStack = new CmdlStack<ActivationRecord>();

  constructor(
    globalAR: ActivationRecord,
    uri: string,
    controller: CmdlCompiler
  ) {
    this.modelStack.push(globalAR);
    this.uri = uri;
    this.controller = controller;
  }

  /**
   * Top level function to initiate the traversal process
   * @param arg RecordNode
   */
  public visit(arg: CMDLNode): void {
    arg.accept(this);
  }

  /**
   * Visits a NamedGroup and creates a model and model activation record based on its type.
   * The model is then executed following traversal of the node's children. Results are written to parent AR.
   * @param node NamedGroup
   */
  public visitRecord(node: CMDLRecord): void {
    // const modelType = typeManager.getModel(node.name);
    // const modelAR = new ActivationRecord(node.name, this.uri);
    // this.modelStack.push(modelAR);
    // const model = ModelFactory.createModel(node.identifier, modelType, modelAR);
    // for (const child of node.children) {
    //   this.visit(child);
    // }
    // this.modelStack.pop();
    // model.execute(this.modelStack.peek());
  }

  /**
   * Writes property values to the current AR.
   * @param node Property
   */
  public visitProperty(node: CMDLProperties): void {
    // const values = node.getValues();
    // const currentAR = this.modelStack.peek();
    // currentAR.setValue(node.name, values);
  }

  /**
   * Creates a model and model AR, traverses node children, and then executes the model.
   * Results are written to parent AR.
   * @deprecated
   * @param node ReferenceGroup
   */
  public visitReference(node: CMDLReference): void {
    // const path = node.getPath();
    // const modelAR = new ActivationRecord(node.name, this.uri);
    // this.modelStack.push(modelAR);
    // const model = ModelFactory.createModel(
    //   node.name,
    //   ModelType.REFERENCE_GROUP,
    //   modelAR,
    //   path
    // );
    // for (const child of node.children) {
    //   this.visit(child);
    // }
    // this.modelStack.pop();
    // model.execute(this.modelStack.peek());
  }

  /**
   * Writes current angle property values to current AR.
   * @param node AngleProperty
   */
  public visitEdgeProp(node: CMDLEdgeProp): void {
    const currentAR = this.modelStack.peek();
    // currentAR.mergeArrayValue("connections", node.export());
  }

  /**
   * Creates a group model, visits children, and tablulates values on current AR.
   * @param node GeneralGroup
   */
  public visitGraph(node: CMDLGraph): void {
    // const groupModel =
    //   node.name === GROUPS.FRAGMENTS ? ModelType.FRAGMENTS : ModelType.GROUP;
    // const modelAR = new ActivationRecord(node.name, this.uri);
    // this.modelStack.push(modelAR);
    // const model = ModelFactory.createModel(node.name, groupModel, modelAR);
    // for (const child of node.children) {
    //   this.visit(child);
    // }
    // this.modelStack.pop();
    // model.execute(this.modelStack.peek());
  }

  /**
   * Visits a import operation node in the AST. Imports values for the given
   * entitiy in to the current AR
   * @deprectate clone class in memory for model
   * @param node ImportOp
   */
  public visitImport(node: CMDLImport): void {
    // const nodeName = node.aliasToken ? node.aliasToken.image : node.name;
    // const sourceFileName = path.basename(node.source);
    // const sourceSymbols = this.controller.getSymbolTable(sourceFileName);
    // const fileRecord = this.controller.getFileAR(sourceFileName);
    // try {
    //   sourceSymbols.get(node.name);
    // } catch (error) {
    //   logger.warn(`No symbol found for ${node.name}, searching for results...`);
    // }
    // let values = fileRecord.getOptionalValue<Clonable>(node.name);
    // if (!values) {
    //   try {
    //     this.controller.executeFile(sourceFileName);
    //     values = fileRecord.getValue<Clonable>(node.name);
    //   } catch (error) {
    //     logger.error(`Encountered error during import operation: ${error}`);
    //     throw new Error(`Unable to import ${node.name} from ${node.source}`);
    //   }
    // }
    // const globalAR = this.modelStack.peek();
    // globalAR.setValue(nodeName, values.clone());
  }

  /**
   *
   * @deprecated
   */
  public visitImportFileOp(node: CMDLImport): void {
    // const fileModel = new CharFileReader(node.source);
    // const globalAR = this.modelStack.peek();
    // globalAR.setValue(node.name, fileModel);
  }

  /**
   *
   * @deprecated
   */
  public visitAssignmentProp(prop: CMDLAssignProp) {
    const currentAR = this.modelStack.peek();
    // currentAR.mergeArrayValue("fragments", {
    //   name: prop.name,
    //   // value: prop.getValues(),
    // });
  }
}
