import { TokenLabel } from "../parser";
import { CMDLToken } from "../cmdl-cst-visitor";
import { AstVisitor } from "../symbols";
import { ASTNode, CMDLReference } from "./collections";
import Big from "big.js";

export type CMDLProperties =
  | CMDLRefProp
  | CMDLBoolProp
  | CMDLStrProp
  | CMDLListProp
  | CMDLNumProp
  | CMDLRefListProp;

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
