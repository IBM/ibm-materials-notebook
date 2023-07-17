import { CmdlToken } from "../cmdl-ast";
import { BaseError } from "../errors";
import { AstVisitor, SymbolTableBuilder } from "../symbols";
import { ModelVisitor } from "../intepreter";
import { Group, RecordNode } from "./base-components";

type ProtocolRef = {
  name: string;
  token: CmdlToken;
};

export class ProtocolGroup extends Group {
  public identifier: string;
  protected idToken: CmdlToken;
  private protocol: CmdlToken[] = [];
  private protocolReferences: ProtocolRef[] = [];

  constructor(token: CmdlToken, idToken: CmdlToken) {
    super(token);
    this.identifier = idToken.image;
    this.idToken = idToken;
  }

  public doValidation(): BaseError[] {
    return [];
  }

  public setParent(arg: RecordNode): void {
    this.parent = arg;
  }

  public addToken(token: CmdlToken): void {
    if (token.type === "ProtocolRef") {
      const refName = token.image.slice(3, token.image.length - 2);
      this.protocolReferences.push({ name: refName, token });
      this.protocol.push(token);
    } else {
      this.protocol.push(token);
    }
  }

  public export() {
    const protocolStrArr = this.protocol.map((el) => el.image);
    const references = this.protocolReferences.map((el) => ({
      name: el.name,
      image: el.token.image,
    }));
    return { protocol: protocolStrArr, references };
  }

  public accept(visitor: AstVisitor): void {
    if (visitor instanceof SymbolTableBuilder) {
      visitor.visitProtocol(this);
    } else if (visitor instanceof ModelVisitor) {
      visitor.visitProtocolGroup(this);
    }
  }

  public print(): string {
    return `Protocol ${this.name}:\n\n${this.protocol
      .map((el) => el.image)
      .join("")}`;
  }
}
