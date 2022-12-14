import * as vscode from "vscode";
import { typeManager } from "./cmdl-types";
import { CmdlCompiler } from "./cmdl-compiler";
import { logger } from "../../logger";
import { GroupTypes, IGroup } from "./cmdl-types/groups";
import { IProperty, PropertyTypes } from "./cmdl-types/properties";
import { AstNodes } from "./cst-visitor";
import { CmdlAst, CmdlNode } from "./cmdl-ast";

/**
 * Assists in providing completion items for CMDL language
 */
export class CmdlCompletions {
  private readonly compiler = new CmdlCompiler();

  static isStringProperty(propName: string) {
    const property = typeManager.getProperty(propName);

    if (!property) {
      return false;
    } else {
      return (
        property.type === PropertyTypes.CATEGORICAL_SINGLE ||
        property.type === PropertyTypes.TEXT
      );
    }
  }

  provideSemanticTokens(document: vscode.TextDocument) {
    const { ast } = this.compiler.parseAST(document.getText());
    const builder = new vscode.SemanticTokensBuilder();

    let queue = [ast.root];
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

  provideHover(position: vscode.Position, document: vscode.TextDocument) {
    const { ast } = this.compiler.parseAST(document.getText());
    const offset = document.offsetAt(position);

    const node = ast.getByOffset(offset);

    if (!node) {
      return;
    } else if (node.name === AstNodes.PROP_ID && node.image) {
      let prop = typeManager.getProperty(node.image);

      return {
        node: node,
        detail: prop?.detail,
        description: prop?.description,
      };
    } else if (node.name === AstNodes.GROUP_ID && node.image) {
      let group = typeManager.getGroup(node.image);

      return {
        node: node,
        detail: group?.detail,
        description: group?.description,
      };
    } else if (node.name === AstNodes.UNIT && node.image) {
      let unit = typeManager.getUnit(node.image);

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
  getCompletions(position: vscode.Position, document: vscode.TextDocument) {
    const { ast } = this.compiler.parseAST(document.getText());
    const range = document.getWordRangeAtPosition(position);
    const word = document.getText(range);

    const node = ast.findNearestGroup();

    if (!node?.parent || !node?.parent?.image) {
      return this.getCompletionsByImage(word, ast);
    }

    let parentName: string = node.parent.image;

    if (parentName === word) {
      const groups = typeManager.searchGroups(parentName);

      if (!groups) {
        return [];
      }

      return [...this.createGroupCompletions(groups)];
    } else if (node.parent.name === AstNodes.REF_GROUP) {
      let refParent = node.parent.parent?.image;

      if (!refParent) {
        return [];
      }

      let parentGroup = typeManager.getGroup(refParent);

      if (!parentGroup) {
        return [];
      }

      const refProps = parentGroup.referenceProps
        .map((el) => typeManager.getProperty(el))
        .filter(typeManager.isProperty);

      return [...this.createPropertyCompletions(refProps)];
    } else {
      let availableGroup = typeManager.getGroup(parentName);

      if (!availableGroup) {
        return [];
      }

      const subGroups = availableGroup.subGroups
        .map((el) => typeManager.getGroup(el))
        .filter(typeManager.isGroup);

      const properties = availableGroup.properties
        .map((el) => typeManager.getProperty(el))
        .filter(typeManager.isProperty);

      return [
        ...this.createGroupCompletions(subGroups),
        ...this.createPropertyCompletions(properties),
      ];
    }
  }

  private getCompletionsByImage(word: string, ast: CmdlAst) {
    const otherNode = ast.findNodeByImage(word);

    if (!otherNode || !otherNode.parent) {
      logger.debug(`unable to find cmdl node by image`, {
        meta: otherNode?.print(),
      });
      return [];
    }

    if (!otherNode.parent.image) {
      let availableGroups = typeManager.searchGroups(otherNode?.image || "");
      return [...this.createGroupCompletions(availableGroups)];
    }

    let availableGroup = typeManager.getGroup(otherNode.parent?.image);

    if (!availableGroup) {
      return [];
    }

    const subGroups = availableGroup.subGroups
      .map((el) => typeManager.getGroup(el))
      .filter(typeManager.isGroup);

    const properties = availableGroup.properties
      .map((el) => typeManager.getProperty(el))
      .filter(typeManager.isProperty);

    return [
      ...this.createGroupCompletions(subGroups),
      ...this.createPropertyCompletions(properties),
    ];
  }

  private createGroupCompletions(arr: IGroup[]) {
    return arr.map((item) => {
      if (item.type === GroupTypes.NAMED) {
        return this.createNamedGroupCompletion(item);
      } else {
        return this.createGeneralGroupCompletion(item);
      }
    });
  }

  private createPropertyCompletions(arr: IProperty[]) {
    return arr.map((item) => {
      if (item.type === PropertyTypes.CATEGORICAL_MULTI) {
        return this.createCategoricalMulti(item);
      } else if (item.type === PropertyTypes.CATEGORICAL_SINGLE) {
        return this.createCategoricalSingle(item);
      } else if (item.type === PropertyTypes.NUMERICAL) {
        return this.createNumericalCompletion(item);
      } else if (item.type === PropertyTypes.NUMERICAL_UNIT) {
        return this.createNumericalUnitCompletion(item);
      } else if (item.type === PropertyTypes.TEXT) {
        return this.createTextCompletion(item);
      } else {
        return this.createRefProperty(item);
      }
    });
  }

  private createRefProperty(prop: IProperty) {
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

  private createCategoricalMulti(prop: IProperty) {
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

  private createCategoricalSingle(prop: IProperty) {
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

  private createTextCompletion(prop: IProperty) {
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

  private createNumericalCompletion(prop: IProperty) {
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

  private createNumericalUnitCompletion(prop: IProperty) {
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

  private createGeneralGroupCompletion(group: IGroup) {
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
  private createNamedGroupCompletion(group: IGroup) {
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
