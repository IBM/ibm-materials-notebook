import { parseStringImage } from "./cmdl-tree/utils";
import { AstNodes } from "./cst-visitor";

export type CmdlToken = {
  image: string;
  type: string;
  startLine: number | undefined;
  endLine: number | undefined;
  startOffset: number | undefined;
  endOffset: number | undefined;
};

type PrintNode = {
  name: string;
  parent: string | null;
  token: Record<string, string | number | undefined> | null;
  children: PrintNode[] | null;
};

/**
 * Node in CMDLAst Tree
 */
export class CmdlNode {
  image?: string;
  value?: string;
  startLine?: number;
  endLine?: number;
  startOffset?: number;
  endOffset?: number;
  parent: CmdlNode | null = null;
  children: CmdlNode[] = [];

  constructor(public name: string) {}

  /**
   * Copies token values to CmdlNode
   * @param arg CmdlToken
   */
  public addTokenValues(arg: CmdlToken): void {
    this.image = arg.image;
    this.startLine = arg.startLine;
    this.endLine = arg.endLine;
    this.startOffset = arg.startOffset;
    this.endOffset = arg.endOffset;

    if (arg.type === "StringLiteral") {
      this.value = parseStringImage(arg.image);
    } else {
      this.value = arg.image;
    }
  }

  /**
   * Adds a child node to current CmdlNode
   * @param node CmdlNode
   */
  public add(node: CmdlNode): void {
    node.parent = this;
    this.children.push(node);
  }

  /**
   * Converts CmdlNode to value printable to console
   * @returns PrintNode
   */
  public print(): PrintNode {
    let children: PrintNode[] | null = null;
    let token: Record<string, string | number | undefined> | null = null;

    if (this.children.length) {
      children = this.children.map((child: CmdlNode) => child.print());
    }

    if (this.image) {
      token = {
        image: this.image,
        value: this.value,
        startLine: this.startLine,
        endLine: this.endLine,
        startOffset: this.startOffset,
        endOffset: this.endOffset,
      };
    }

    return {
      name: this.name,
      parent: this.parent ? this.parent.name : null,
      token,
      children,
    };
  }
}

/**
 * Class to handle AST generated by CSTVisitor class
 * Enable queries on AST for generating contextualized completion items, hovers, and semantic tokens
 */
export class CmdlAst {
  root: CmdlNode | null = null;

  public print() {
    if (!this.root) {
      return "";
    }
    return this.root.print();
  }

  /**
   * Retrieves and returns CMDLNode in CmdlAst by text offset. Returns undefined if not found
   * @param offset number
   * @returns CmdlNode | undefined
   */
  public getByOffset(offset: number): CmdlNode | undefined {
    const queue = [this.root];
    let curr: CmdlNode | null | undefined;
    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr.children.length) {
        for (const child of curr.children) {
          queue.unshift(child);
        }
      }

      if (curr.startOffset === undefined || !curr.endOffset) {
        continue;
      } else {
        if (curr.startOffset <= offset && curr.endOffset + 1 >= offset) {
          return curr;
        }
      }
    }
  }

  /**
   * Finds a CMDLNode in the CmdlAst by token image
   * @param image string
   * @returns CmdlNode | undefined
   */
  public findNodeByImage(image: string): CmdlNode | undefined {
    const queue = [this.root];
    let curr: CmdlNode | null | undefined;
    while (queue.length) {
      curr = queue.shift();

      if (!curr) {
        break;
      }

      if (curr.image && curr.image === image) {
        return curr;
      }

      if (curr.children.length) {
        for (const child of curr.children) {
          queue.unshift(child);
        }
      }
    }
  }

  /**
   * Finds nearest group in CMDL text for completion items
   * @returns CmdlNode | undefined
   */
  public findNearestGroup(): CmdlNode | undefined {
    const stack: CmdlNode[] = [];
    const queue: CmdlNode[] = [];
    let node: CmdlNode | undefined;

    function traverse(current: CmdlNode | null) {
      if (!current) {
        return;
      }

      if (
        current.name === AstNodes.GROUP_LCURL ||
        current.name === AstNodes.GROUP_RCURL
      ) {
        stack.push(current);
      }

      if (current.children.length) {
        for (const child of current.children) {
          traverse(child);
        }
      }
    }

    traverse(this.root);

    while (stack.length) {
      node = stack.pop();

      if (!node) {
        break;
      }

      if (node.name === AstNodes.GROUP_LCURL) {
        if (!queue.length) {
          return node;
        } else {
          queue.shift();
          continue;
        }
      }

      if (node.name === AstNodes.GROUP_RCURL) {
        queue.unshift(node);
        continue;
      }
    }
  }
}
