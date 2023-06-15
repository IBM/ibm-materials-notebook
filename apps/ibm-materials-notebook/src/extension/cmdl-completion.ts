import * as vscode from "vscode";
import { CMDLCompiler, CMDLTypes, CMDLAst, AstNodes } from "cmdl";
import { logger } from "../logger";

/**
 * Assists in providing completion items for CMDL language
 * TODO: move to language server
 */
export class CmdlCompletions {
  private readonly compiler = new CMDLCompiler.Compiler();

  static isStringProperty(propName: string) {
    const property = CMDLTypes.typeManager.getProperty(propName);

    if (!property) {
      return false;
    } else {
      return (
        property.type === CMDLTypes.PropertyTypes.CATEGORICAL_SINGLE ||
        property.type === CMDLTypes.PropertyTypes.TEXT
      );
    }
  }

  /**
   * Provides semantic tokens for CMDL document
   * @param document vscode.TextDocument
   * @returns vscode.SemanticTokensBuilder | undefined
   */
  public provideSemanticTokens(
    document: vscode.TextDocument
  ): vscode.SemanticTokensBuilder | undefined {
    const { ast } = this.compiler.parseAST(document.getText());
    if (!ast) {
      return;
    }
    const builder = new vscode.SemanticTokensBuilder();

    let queue = [ast.root];
    let curr: CMDLAst.CmdlNode | null | undefined;

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

      if (curr.startOffset && curr.endOffset) {
        const { line, character } = document.positionAt(curr.startOffset);

        if (
          curr.name === AstNodes.GROUP_ID ||
          curr.name === AstNodes.REF_ID_PROP
        ) {
          builder.push(
            line,
            character,
            curr.endOffset + 1 - curr.startOffset,
            2
          );
          continue;
        }

        if (curr.name === AstNodes.PROP_ID) {
          builder.push(
            line,
            character,
            curr.endOffset + 1 - curr.startOffset,
            1
          );
          continue;
        }

        if (
          curr.name === AstNodes.IMPORT ||
          curr.name === AstNodes.FROM ||
          curr.name === AstNodes.AS
        ) {
          builder.push(
            line,
            character,
            curr.endOffset + 1 - curr.startOffset,
            2
          );
          continue;
        }

        if (curr.name === AstNodes.GROUP) {
          builder.push(
            line,
            character,
            curr.endOffset + 1 - curr.startOffset,
            0
          );
          continue;
        }
      }
    }

    return builder;
  }

  /**
   * Provides hover items for current text document
   * @TODO specify return type
   * @param position vscode.Position
   * @param document vscode.TextDocument
   * @returns
   */
  public provideHover(
    position: vscode.Position,
    document: vscode.TextDocument
  ): Record<string, any> | undefined {
    const { ast } = this.compiler.parseAST(document.getText());
    if (!ast) {
      return;
    }
    const offset = document.offsetAt(position);

    const node = ast.getByOffset(offset);

    if (!node) {
      return;
    } else if (node.name === AstNodes.PROP_ID && node.image) {
      let prop = CMDLTypes.typeManager.getProperty(node.image);

      return {
        node: node,
        detail: prop?.detail,
        description: prop?.description,
      };
    } else if (node.name === AstNodes.GROUP_ID && node.image) {
      let group = CMDLTypes.typeManager.getGroup(node.image);

      return {
        node: node,
        detail: group?.detail,
        description: group?.description,
      };
    } else if (node.name === AstNodes.UNIT && node.image) {
      let unit = CMDLTypes.typeManager.getUnit(node.image);

      return {
        node: node,
        detail: unit?.detail,
        description: unit?.description,
      };
    } else {
      return;
    }
  }

  /**
   * Searches AST and types to provide context specific completion items
   * @TODO  verbose, refactor for conciseness
   * @param position vscode.Position
   * @param document vscode.TextDocument
   * @returns vscode.CompletiionItem[]
   */
  public getCompletions(
    position: vscode.Position,
    document: vscode.TextDocument
  ): vscode.CompletionItem[] | undefined {
    const { ast } = this.compiler.parseAST(document.getText());
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range);

    if (!ast) {
      return;
    }
    const node = ast.findNearestGroup();

    if (!node?.parent || !node?.parent?.image) {
      return this.getCompletionsByImage(word, ast);
    }

    let parentName: string = node.parent.image;

    if (parentName === word) {
      const groups = CMDLTypes.typeManager.searchGroups(parentName);

      if (!groups) {
        return [];
      }

      return [...this.createGroupCompletions(groups)];
    } else if (node.parent.name === AstNodes.REF_GROUP) {
      let refParent = node.parent.parent?.image;

      if (!refParent) {
        return [];
      }

      let parentGroup = CMDLTypes.typeManager.getGroup(refParent);

      if (!parentGroup) {
        return [];
      }

      const refProps = parentGroup.referenceProps
        .map((el) => CMDLTypes.typeManager.getProperty(el))
        .filter(CMDLTypes.typeManager.isProperty);

      return [...this.createPropertyCompletions(refProps)];
    } else {
      let availableGroup = CMDLTypes.typeManager.getGroup(parentName);

      if (!availableGroup) {
        return [];
      }

      const subGroups = availableGroup.subGroups
        .map((el) => CMDLTypes.typeManager.getGroup(el))
        .filter(CMDLTypes.typeManager.isGroup);

      const properties = availableGroup.properties
        .map((el) => CMDLTypes.typeManager.getProperty(el))
        .filter(CMDLTypes.typeManager.isProperty);

      return [
        ...this.createGroupCompletions(subGroups),
        ...this.createPropertyCompletions(properties),
      ];
    }
  }

  private getCompletionsByImage(word: string, ast: CMDLAst.CmdlAst) {
    const otherNode = ast.findNodeByImage(word);

    if (!otherNode || !otherNode.parent) {
      logger.debug(`unable to find cmdl node by image`, {
        meta: otherNode?.print(),
      });
      return [];
    }

    if (!otherNode.parent.image) {
      let availableGroups = CMDLTypes.typeManager.searchGroups(
        otherNode?.image || ""
      );
      return [...this.createGroupCompletions(availableGroups)];
    }

    let availableGroup = CMDLTypes.typeManager.getGroup(
      otherNode.parent?.image
    );

    if (!availableGroup) {
      return [];
    }

    const subGroups = availableGroup.subGroups
      .map((el) => CMDLTypes.typeManager.getGroup(el))
      .filter(CMDLTypes.typeManager.isGroup);

    const properties = availableGroup.properties
      .map((el) => CMDLTypes.typeManager.getProperty(el))
      .filter(CMDLTypes.typeManager.isProperty);

    return [
      ...this.createGroupCompletions(subGroups),
      ...this.createPropertyCompletions(properties),
    ];
  }

  /**
   * Creates completion items for groups
   * @param arr IGroup[]
   * @returns vscode.CompletionItem[]
   */
  private createGroupCompletions(
    arr: CMDLTypes.IGroup[]
  ): vscode.CompletionItem[] {
    return arr.map((item) => {
      if (item.type === CMDLTypes.GroupTypes.NAMED) {
        return this.createNamedGroupCompletion(item);
      } else {
        return this.createGeneralGroupCompletion(item);
      }
    });
  }

  /**
   * Creates completion items fro properties
   * @param arr IProperty[]
   * @returns vscode.CompletionItem[]
   */
  private createPropertyCompletions(
    arr: CMDLTypes.IProperty[]
  ): vscode.CompletionItem[] {
    return arr.map((item) => {
      if (item.type === CMDLTypes.PropertyTypes.CATEGORICAL_MULTI) {
        return this.createCategoricalMulti(item);
      } else if (item.type === CMDLTypes.PropertyTypes.CATEGORICAL_SINGLE) {
        return this.createCategoricalSingle(item);
      } else if (item.type === CMDLTypes.PropertyTypes.NUMERICAL) {
        return this.createNumericalCompletion(item);
      } else if (item.type === CMDLTypes.PropertyTypes.NUMERICAL_UNIT) {
        return this.createNumericalUnitCompletion(item);
      } else if (item.type === CMDLTypes.PropertyTypes.TEXT) {
        return this.createTextCompletion(item);
      } else {
        return this.createRefProperty(item);
      }
    });
  }

  /**
   * Creates completion item for a reference property
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createRefProperty(prop: CMDLTypes.IProperty): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: `);
    textSnippet.appendTabstop();
    textSnippet.appendText(";");

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a categorical property
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createCategoricalMulti(
    prop: CMDLTypes.IProperty
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: ["`);
    textSnippet.appendChoice(prop.categorical_values || []);
    textSnippet.appendText('"]');
    textSnippet.appendText(";");

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a single categorical property
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createCategoricalSingle(
    prop: CMDLTypes.IProperty
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: `);
    textSnippet.appendText('"');
    textSnippet.appendChoice(prop.categorical_values || []);
    textSnippet.appendText('"');
    textSnippet.appendText(";");

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a text property
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createTextCompletion(
    prop: CMDLTypes.IProperty
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: `);
    textSnippet.appendText('"');
    textSnippet.appendTabstop();
    textSnippet.appendText('"');
    textSnippet.appendText(";");

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a numerical property
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createNumericalCompletion(
    prop: CMDLTypes.IProperty
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: `);
    textSnippet.appendPlaceholder("VALUE");
    textSnippet.appendText(";");

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a numerical property with a unit
   * @param prop IProperty
   * @returns vscode.CompletionItem
   */
  private createNumericalUnitCompletion(
    prop: CMDLTypes.IProperty
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${prop.name}: `);
    textSnippet.appendPlaceholder("VALUE");
    textSnippet.appendText(" ");

    if (prop?.units) {
      textSnippet.appendChoice(prop.units);
    }
    textSnippet.appendText(";");
    textSnippet.appendTabstop();

    return {
      label: prop.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Property,
      documentation: prop.description,
      detail: prop.detail,
    };
  }

  /**
   * Creates completion item for a group
   * @param prop IGroup
   * @returns vscode.CompletionItem
   */
  private createGeneralGroupCompletion(
    group: CMDLTypes.IGroup
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${group.name} {`);
    textSnippet.appendText("\n");
    textSnippet.appendText("\t");
    textSnippet.appendTabstop();
    textSnippet.appendText("\n");
    textSnippet.appendText("}");

    return {
      label: group.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Struct,
      documentation: group.description,
      detail: group.detail,
    };
  }
  /**
   * Creates completion item for a group
   * @param prop IGroup
   * @returns vscode.CompletionItem
   */
  private createNamedGroupCompletion(
    group: CMDLTypes.IGroup
  ): vscode.CompletionItem {
    const textSnippet = new vscode.SnippetString();
    textSnippet.appendText(`${group.name} `);
    textSnippet.appendPlaceholder("NAME");
    textSnippet.appendText(" {");
    textSnippet.appendText("\n");
    textSnippet.appendText("\t");
    textSnippet.appendTabstop();
    textSnippet.appendText("\n");
    textSnippet.appendText("}");

    return {
      label: group.name,
      insertText: textSnippet,
      kind: vscode.CompletionItemKind.Class,
      documentation: group.description,
      detail: group.detail,
    };
  }
}
