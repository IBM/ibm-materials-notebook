import { TokenLabel, TokenTypes } from "../parser";
import { CMDLToken } from "../cmdl-cst-visitor";
import { AstVisitor } from "../symbols";
import Big from "big.js";

export type CMDLProperties =
  | CMDLRefProp
  | CMDLBoolProp
  | CMDLStrProp
  | CMDLListProp
  | CMDLNumProp
  | CMDLRefListProp;

/**
 * Interface for a record node in the CMDL component AST
 */
export interface CMDLNode {
  parent: CMDLNode | null;
  children: CMDLNode[];
  setParent(arg: CMDLNode): void;
  addChildNode(node: CMDLNode): void;
  accept(visitor: AstVisitor): void;
}

interface Serialize {
  print(): string;
}

class NodeTokenManager {
  start: number = 0;
  stop: number = 0;
  statement_start?: number;
  statement_stop?: number;
  body_start?: number;
  body_stop?: number;
  tokens: CMDLToken[] = [];

  add(token: CMDLToken) {
    if (this.isStartToken(token.type)) {
      this.start = token.startOffset;
      this.statement_start = token.startOffset;
    }

    if (token.type === TokenTypes.LCURL) {
      this.statement_stop = token.startOffset;
      this.body_start = token.startOffset;
    }

    if (token.type === TokenTypes.RCURL || token.type === TokenTypes.END) {
      this.body_stop = token.startOffset;
    }

    if (token.endOffset && token.endOffset > this.stop) {
      this.stop = token.endOffset;
    }

    this.tokens.push(token);
  }

  private isStartToken(tokenType: TokenTypes): boolean {
    return (
      tokenType === TokenTypes.PROP ||
      tokenType === TokenTypes.COLLECTION ||
      tokenType === TokenTypes.GRAPH ||
      tokenType === TokenTypes.RECORD ||
      tokenType === TokenTypes.IMPORT ||
      tokenType === TokenTypes.REF
    );
  }

  visit() {
    //enable iteration through tokens
    throw new Error("Not implemented!");
  }

  checkRange(offset: number) {
    //check if offset is within node range
    //return true or false
    throw new Error("Not Implemented");
  }
}

abstract class ASTNode implements CMDLNode, Serialize {
  nodeTokens: NodeTokenManager = new NodeTokenManager();
  parent: CMDLNode | null = null;
  children: CMDLNode[] = [];

  abstract accept(visitor: AstVisitor): void;
  abstract print(): string;

  public addChildNode(node: CMDLNode): void {
    node.setParent(this);
    this.children.push(node);
  }

  public setParent(arg: CMDLNode): void {
    this.parent = arg;
  }

  protected parseStringImage(strImage: string) {
    return strImage.slice(1, strImage.length - 1);
  }
}

export class CMDLRoot extends ASTNode {
  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLImport extends ASTNode {
  name?: string;
  source?: string;
  alias?: string;

  constructor(...tokens: (CMDLToken | undefined)[]) {
    super();

    for (const token of tokens) {
      if (!token) {
        continue;
      }

      if (token.label === TokenLabel.IMPORT_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.IMPORT_ALIAS) {
        this.alias = token.image;
      }

      if (token.label === TokenLabel.IMPORT_SOURCE) {
        this.source = token.image;
      }

      this.nodeTokens.add(token);
    }
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLGraph extends ASTNode {
  name?: string;
  type?: string;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.GRAPH_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.TYPE) {
        this.type = token.image;
      }
      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLReference extends ASTNode {
  name?: string;
  path: string[] = [];

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.REF_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.REF_ITEM) {
        this.path.push(token.image);
      }
      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLCollection extends ASTNode {
  name?: string;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.COL_NAME) {
        this.name = token.image;
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLRecord extends ASTNode {
  name?: string;
  type?: string;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.RECORD_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.TYPE) {
        this.type = token.image;
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLStrProp extends ASTNode {
  name?: string;
  value?: string;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.PROP_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.STR_VALUE) {
        this.value = token.image;
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLAssignProp extends ASTNode {
  name?: string;
  type?: string;
  value?: string;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.PROP_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.TYPE) {
        this.type = token.image;
      }

      if (token.label === TokenLabel.STR_VALUE) {
        this.value = token.image;
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLBoolProp extends ASTNode {
  name?: string;
  value?: boolean;

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.PROP_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.BOOL_VALUE) {
        this.value = token.image === "true" ? true : false;
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLNumProp extends ASTNode {
  name?: string;
  value?: number;
  uncertainty?: number;
  unit?: string;

  constructor(...tokens: (CMDLToken | undefined)[]) {
    super();
    for (const token of tokens) {
      if (!token) {
        continue;
      }

      if (token.label === TokenLabel.PROP_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.NUM_VALUE) {
        this.value = Big(token.image).toNumber();
      }

      if (token.label === TokenLabel.NUM_UNIT) {
        this.unit = token.image;
      }

      if (token.label === TokenLabel.UNC_VALUE) {
        this.uncertainty = Big(token.image).toNumber();
      }

      this.nodeTokens.add(token);
    }
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLListProp extends ASTNode {
  name?: string;
  values: string[] = [];

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      if (token.label === TokenLabel.PROP_NAME) {
        this.name = token.image;
      }

      if (token.label === TokenLabel.STR_VALUE) {
        this.values.push(token.image);
      }

      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLRefProp extends ASTNode {
  name?: string;
  refName?: string;
  refPath: string[] = [];

  constructor(...tokens: CMDLToken[]) {
    super();
    tokens.forEach((token) => {
      //set collection name
      this.nodeTokens.add(token);
    });
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLRefListProp extends ASTNode {
  name?: string;

  constructor(...items: (CMDLToken | CMDLReference)[]) {
    super();
    for (const item of items) {
      if (item instanceof CMDLReference) {
        this.addChildNode(item);
        continue;
      }

      if (item.label === TokenLabel.PROP_NAME) {
        this.name = item.image;
      }

      this.nodeTokens.add(item);
    }
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}

export class CMDLEdgeProp extends ASTNode {
  lhs: CMDLReference[] = [];
  rhs: CMDLReference[] = [];
  value?: number;

  constructor(...tokens: (CMDLToken | undefined)[]) {
    super();
    for (const item of tokens) {
      if (!item) {
        continue;
      }

      if (item.label === TokenLabel.EDGE_VALUE) {
        this.value = parseInt(item.image);
      }

      this.nodeTokens.add(item);
    }
  }

  addRefs(refs: CMDLReference[], side: "lhs" | "rhs") {
    if (side === "lhs") {
      this.lhs.push(...refs);
    } else {
      this.rhs.push(...refs);
    }
    refs.forEach((el) => this.addChildNode(el));
  }

  accept(visitor: AstVisitor): void {
    throw new Error("Method not implemented.");
  }
  print(): string {
    throw new Error("Method not implemented.");
  }
}
