import * as vscode from "vscode";
import { CmdlCompletions } from "./cmdl-completion";
import { Repository } from "./respository";
import { Validation } from "./validator";

export const LANGUAGE = "cmdl";
export const NOTEBOOK = "ibm-materials-notebook";

const selector = { language: LANGUAGE };

class CompletionItemProvider implements vscode.CompletionItemProvider {
  private readonly _completionProvider = new CmdlCompletions();

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
    // token: vscode.CancellationToken,
    // context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    //Supress completions if line starts with keyword import
    const importRegex = new RegExp(/^import/);
    const importRange = document.getWordRangeAtPosition(position);
    const importWord = document.getText(importRange);

    if (importRegex.test(importWord)) {
      return;
    }

    const competionItems = this._completionProvider.getCompletions(
      position,
      document
    );
    return competionItems;
  }
}

class ImportProvder implements vscode.CompletionItemProvider {
  readonly completionProvider = new CmdlCompletions();
  constructor(readonly repository: Repository) {}

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
    // token: vscode.CancellationToken,
    // context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    const range = document.getWordRangeAtPosition(
      position,
      /import\s[a-zA-Z0-9_-]+/
    );

    if (!range) {
      return;
    }

    const word = document.getText(range);

    const wordArr = word.split(" ");
    if (wordArr[0] !== "import") {
      return;
    }

    const modules: string[] = [];
    const libRegex = new RegExp("/lib/");
    for (const [key, value] of this.repository.getItems()) {
      if (libRegex.test(key)) {
        modules.push(this.repository.extractFileName(value.uri));
      }
    }

    const matchingItems = this.repository._controller.provideImportCompletions(
      modules,
      wordArr[1]
    );

    const completionItems: vscode.CompletionItem[] = matchingItems.map(
      (item: any) => {
        const textSnippet = new vscode.SnippetString();

        textSnippet.appendText(`${item.name} from "./lib/${item.module}";`);

        return {
          label: item.name,
          insertText: textSnippet,
          kind: vscode.CompletionItemKind.Interface,
          documentation: "entity documentation",
          detail: "entity detail",
        };
      }
    );

    return completionItems;
  }
}

class SymbolProvider implements vscode.CompletionItemProvider {
  static readonly triggerCharacters = ["@"];
  constructor(readonly repository: Repository) {}

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
      return;
    }

    const namespace = this.repository.extractFileName(document.uri);
    const symbols =
      this.repository._controller.getNamespaceDeclarations(namespace);

    const results = symbols.map((el: any) => {
      return {
        label: el.name,
        kind: vscode.CompletionItemKind.Value,
        documentation: "symbol...",
        detail: "symbol..",
      };
    });

    return results;
  }
}

class SymbolMemberProvider implements vscode.CompletionItemProvider {
  static readonly triggerCharacters = ["."];
  private readonly _completionProvider = new CmdlCompletions();
  constructor(readonly repository: Repository) {}

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    if (context.triggerKind === vscode.CompletionTriggerKind.Invoke) {
      return;
    }

    const range = document.getWordRangeAtPosition(position, /[@a-zA-Z0-9-_.]+/);
    const word = document.getText(range);

    const slicedWord = word.slice(1, -1);

    const namespace = this.repository.extractFileName(document.uri);
    const symbols = this.repository._controller.getNamespaceSymbolMembers(
      namespace,
      slicedWord
    );

    if (!symbols) {
      return;
    }

    const results = symbols.map((el: any) => {
      return {
        label: el.name,
        kind: vscode.CompletionItemKind.Field,
        documentation: "symbol...",
        detail: "symbol..",
      };
    });

    return results;
  }
}

class HoverProvider implements vscode.HoverProvider {
  private readonly _completionProvider = new CmdlCompletions();
  constructor(readonly repository: Repository) {}

  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
    // token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const nodeGroup = this._completionProvider.provideHover(position, document);
    const range = document.getWordRangeAtPosition(position, /[@a-zA-Z0-9-_]+/);
    const word = document.getText(range);
    if (!nodeGroup) {
      const text = document.getText(range);
      return new vscode.Hover(text, range);
    } else {
      const markdownText = new vscode.MarkdownString();
      markdownText.appendMarkdown(`**${word}** — *${nodeGroup.detail}*`);
      markdownText.appendMarkdown(`\n\n${nodeGroup.description}`);
      return new vscode.Hover(markdownText, range);
    }
  }
}

class SemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
  static readonly legend = new vscode.SemanticTokensLegend([
    "class",
    "property",
    "keyword",
  ]);
  private readonly _completionProvider = new CmdlCompletions();

  public provideDocumentSemanticTokens(
    document: vscode.TextDocument
    // token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.SemanticTokens> {
    const builder = this._completionProvider.provideSemanticTokens(document);
    if (!builder) {
      return;
    }
    return builder.build();
  }
}

export function registerLanguageProvider(repo: Repository): vscode.Disposable {
  const disposables: vscode.Disposable[] = [];
  const symbolProvider = new SymbolProvider(repo);
  const memberProvider = new SymbolMemberProvider(repo);

  vscode.languages.setLanguageConfiguration(selector.language, {
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ['"', '"'],
    ],
  });

  // register language configuration
  disposables.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new CompletionItemProvider()
    )
  );

  disposables.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      symbolProvider,
      ...SymbolProvider.triggerCharacters
    )
  );

  disposables.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      memberProvider,
      ...SymbolMemberProvider.triggerCharacters
    )
  );

  disposables.push(
    vscode.languages.registerCompletionItemProvider(
      selector,
      new ImportProvder(repo)
    )
  );

  disposables.push(
    vscode.languages.registerHoverProvider(selector, new HoverProvider(repo))
  );

  disposables.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      selector,
      new SemanticTokenProvider(),
      SemanticTokenProvider.legend
    )
  );

  disposables.push(new Validation(repo));

  return vscode.Disposable.from(...disposables);
}
