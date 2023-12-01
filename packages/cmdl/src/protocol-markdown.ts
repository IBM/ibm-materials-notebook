import {
  marked,
  Token,
  TokenizerAndRendererExtension,
  TokensList,
} from "marked";
import { TAGS, TYPES } from "./cmdl-types";
import { ActivationRecordTable } from "./intepreter";
import { ReactionEntity } from "./intepreter/entities";
import { CmdlCompiler } from "./cmdl-compiler";
import { logger } from "./logger";

enum CMDLTokenTypes {
  CMDL_LINK = "cmdlLink",
  CMDL_REF = "cmdlRef",
}

const cmdlLink: TokenizerAndRendererExtension = {
  name: CMDLTokenTypes.CMDL_LINK,
  level: "inline",
  start(src: string) {
    return src.match(/\[\[/)?.index;
  },
  tokenizer(src) {
    const rule = /^\[\[@([_a-zA-Z0-9-]+)\]\]/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: CMDLTokenTypes.CMDL_LINK,
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer() {
    return ``.trim();
  },
};

const cmdlRef: TokenizerAndRendererExtension = {
  name: CMDLTokenTypes.CMDL_REF,
  level: "inline",
  start(src: string) {
    return src.match(/{{/)?.index;
  },
  tokenizer(src: string) {
    const rule = /^{{@([_a-zA-Z0-9-]+)}}/;
    const match = rule.exec(src);
    if (match) {
      return {
        type: CMDLTokenTypes.CMDL_REF,
        raw: match[0],
        text: match[1].trim(),
      };
    }
  },
  renderer(token) {
    return `${token?.text}`;
  },
};

/**
 * Parser for CMDP cells
 *
 */
export class CMDPParser {
  private compiler: CmdlCompiler;
  private fileAR?: ActivationRecordTable;
  private lookupCache: Record<string, Record<string, string>> = {};
  private protocolStrings: Record<string, string> = {};
  private readonly markedParser = marked.use({
    extensions: [cmdlRef, cmdlLink],
  });
  private parentEntity?: string;

  constructor(compiler: CmdlCompiler) {
    this.compiler = compiler;
    this.walkTokens = this.walkTokens.bind(this);
  }

  private compileProtocolString(tokens: TokensList): void {
    let currentHeader: Token | undefined;
    let currentParent: Token | undefined;
    let parentEntity: string | undefined;
    let currentRxnValues: Record<string, TYPES.ReactionChemicalOutput> = {};
    let cachedValues: Record<string, string> = {};
    const queue = [...tokens];
    let text = "";

    let currentToken: Token | undefined;
    while (queue.length) {
      currentToken = queue.shift();

      if (!currentToken) {
        break;
      }

      if (currentToken.type === "heading" && currentToken.depth === 1) {
        if (currentHeader && parentEntity) {
          this.lookupCache[parentEntity] = { ...cachedValues };
          this.protocolStrings[parentEntity] = text;
          cachedValues = {};
          text = "";
          parentEntity = undefined;
        }
        currentHeader = currentToken;
      }

      if ("tokens" in currentToken && currentToken?.tokens) {
        currentParent = currentToken;
        for (let i = currentToken.tokens.length - 1; i > -1; i--) {
          queue.unshift(currentToken.tokens[i]);
        }
      } else if (this.isCMDLToken(currentToken) && "text" in currentToken) {
        if (
          currentHeader?.type === currentParent?.type &&
          currentHeader?.raw === currentParent?.raw
        ) {
          logger.verbose(
            `Setting current entity: ${currentToken.type} ${currentToken.text}`
          );
          parentEntity = currentToken.text;
          const extractedValues = this.extractReactionEntities(
            currentToken.text
          );
          currentRxnValues = {
            ...extractedValues,
          };
        } else {
          if (parentEntity && currentToken.text in currentRxnValues) {
            const reactant = currentRxnValues[currentToken.text];
            const refStr = this.createRefString(reactant);

            cachedValues[currentToken.text] = refStr;
            text = `${text}${refStr}`;
          }
        }
      } else if ("text" in currentToken && currentParent?.type === "heading") {
        text = `${text}${currentToken.text}\n`;
      } else if ("text" in currentToken) {
        text = `${text}${currentToken.text}`;
      } else {
        text = `${text}${currentToken.raw}`;
      }
    }

    if (parentEntity) {
      this.lookupCache[parentEntity] = { ...cachedValues };
      this.protocolStrings[parentEntity] = text.trim();
    }
  }

  private extractReactionEntities(entityName: string) {
    if (!this.fileAR) {
      logger.warn(
        `File AR not set when parsing protocol linked to entity: ${entityName}`
      );
      return;
    }
    const currentRxnValues: Record<string, TYPES.ReactionChemicalOutput> = {};
    const entity = this.fileAR.getValue(entityName);
    if (entity instanceof ReactionEntity) {
      const reactionValues = entity.export();

      for (const value of reactionValues.reactants) {
        currentRxnValues[value.name] = value;
      }
    }

    return currentRxnValues;
  }

  private createRefString(reactant: TYPES.ReactionChemicalOutput): string {
    let refStr: string;

    const alias =
      "aliases" in reactant.entity && reactant.entity.aliases
        ? reactant.entity.aliases[0]
        : undefined;

    if (reactant.roles.includes(TAGS.SOLVENT)) {
      refStr = `${alias || reactant.name} (${
        reactant?.volume?.value ? reactant.volume.value : reactant.mass.value
      } ${reactant?.volume?.unit ? reactant.volume.unit : reactant.mass.unit})`;
    } else {
      refStr = `${alias || reactant.name} (${reactant.mass.value} ${
        reactant.mass.unit
      }, ${reactant.moles.value} ${reactant.moles.unit}, ${
        reactant.ratio
      } equiv.)`;
    }

    return refStr;
  }

  private walkTokens(token: Token) {
    if (token.type === "heading" && token.depth === 1 && token?.tokens) {
      for (const subToken of token.tokens) {
        if (subToken.type === CMDLTokenTypes.CMDL_LINK) {
          this.parentEntity = subToken.text;
        }
      }
    }

    if (this.isCMDLToken(token) && "text" in token && this.parentEntity) {
      token.text =
        this.lookupCache[this.parentEntity] &&
        this.lookupCache[this.parentEntity][token.text]
          ? this.lookupCache[this.parentEntity][token.text]
          : token.text;
    }
  }

  private isCMDLToken(token: Token): boolean {
    return (
      token.type === CMDLTokenTypes.CMDL_LINK ||
      token.type === CMDLTokenTypes.CMDL_REF
    );
  }

  public parse(text: string, filename: string) {
    this.fileAR = this.compiler.getFileAR(filename);
    this.markedParser.use({ walkTokens: this.walkTokens });
    const tokens = this.markedParser.lexer(text);
    this.compileProtocolString(tokens);
    const html = this.markedParser.parse(text);
    return { protocolStrings: this.protocolStrings, html };
  }
}

export class ProtocolTableManager {
  private readonly _tables = new Map<string, ProtocolTable>();

  public create(filename: string): void {
    const protocolTable = new ProtocolTable();
    this._tables.set(filename, protocolTable);
  }

  public get(filename: string): ProtocolTable {
    const table = this._tables.get(filename);
    if (!table) {
      throw new Error(`Protocol table does not exist for ${filename}`);
    }
    return table;
  }

  public delete(filename: string): void {
    this._tables.delete(filename);
  }
}

export class ProtocolTable {
  private readonly _protocols = new Map<string, Record<string, string>>();

  public create(
    cellUri: string,
    protocolStrings: Record<string, string>
  ): void {
    this._protocols.set(cellUri, protocolStrings);
  }

  public getByCellUri(cellUri: string): Record<string, string> {
    const protocolStrings = this._protocols.get(cellUri);
    if (!protocolStrings) {
      throw new Error(`No protocols found for cell: ${cellUri}`);
    }
    return protocolStrings;
  }

  public getByEntity(entity: string): string[] {
    const entityProtocols = [];
    for (const record of this._protocols.values()) {
      if (entity in record) {
        entityProtocols.push(record[entity]);
      }
    }
    return entityProtocols;
  }

  public delete(cellUri: string): void {
    this._protocols.delete(cellUri);
  }
}
