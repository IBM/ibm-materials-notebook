import { TokenLabel, TokenTypes } from "../parser";
import { CMDLToken } from "../parser/cst-visitor";
import { AstVisitor, SymbolTableBuilder } from "../symbols";

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

export class NodeTokenManager {
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

  checkRange(offset: number): boolean {
    if (offset >= this.start && offset <= this.stop) {
      return true;
    } else {
      return false;
    }
  }
}

export abstract class ASTNode implements CMDLNode, Serialize {
  nodeTokens: NodeTokenManager = new NodeTokenManager();
  parent: ASTNode | null = null;
  children: ASTNode[] = [];

  abstract accept(visitor: AstVisitor): void;
  abstract print(): string;

  public addChildNode(node: ASTNode): void {
    node.setParent(this);
    this.children.push(node);
  }

  public setParent(arg: ASTNode): void {
    this.parent = arg;
  }

  protected parseStringImage(strImage: string) {
    return strImage.slice(1, strImage.length - 1);
  }
}

export class CMDLRoot extends ASTNode {
  accept(visitor: AstVisitor): void {
    for (const child of this.children) {
      visitor.visit(child);
    }
  }
  print(): string {
    const header = `root node:\n`;
    const sep = "____________________________________";
    const body = this.children.map((el) => el.print()).join("\n\t");
    return `${header}${sep}${body}`;
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
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitImport(this);
    }
  }
  print(): string {
    return `import ${this.name} from ${this.source}${
      this.alias ? ` from ${this.alias}` : ""
    }`;
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
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitGraph(this);
    }
  }
  print(): string {
    const header = `graph ${this.name} of ${this.type}:\n`;
    const sep = `-------------------------------------`;
    const body = this.children.map((el) => el.print()).join("\n\t");
    const footer = `\nend graph ${this.name}`;
    return `${header}${sep}${body}${footer}`;
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
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitReference(this);
    }
  }
  print(): string {
    return `ref ${this.name}${
      this.path.length ? ` with path of ${this.path.join(" ,")}` : ""
    }`;
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
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitCollection(this);
    }
  }
  print(): string {
    const header = `collection ${this.name}:\n`;
    const sep = `-------------------------------------`;
    const body = this.children.map((el) => el.print()).join("\n\t");
    const footer = `\nend collection ${this.name}`;
    return `${header}${sep}${body}${footer}`;
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
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitRecord(this);
    }
  }
  print(): string {
    const header = `record ${this.name} of ${this.type}:\n`;
    const sep = `-------------------------------------`;
    const body = this.children.map((el) => el.print()).join("\n\t");
    const footer = `\nend record ${this.name}`;
    return `${header}${sep}${body}${footer}`;
  }
}
