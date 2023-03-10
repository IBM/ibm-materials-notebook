import { AstContainer, BaseComponent } from "./bigsmiles";

class TreeConfig {
  static treeSymbolOptions: Record<string, string[]> = {
    ascii: ["|", "|-- ", "+-- "],
    "ascii-ex": ["\u2502", "\u251c\u2500\u2500", "\u2514\u2500\u2500"],
    "ascii-exr": ["\u2502", "\u251c\u2500\u2500", "\u2570\u2500\u2500"],
    "ascii-em": ["\u2551", "\u2560\u2550\u2550", "\u255a\u2550\u2550"],
    "ascii-emv": ["\u2551", "\u255f\u2500\u2500", "\u2559\u2500\u2500"],
    "ascii-emh": ["\u2502", "\u255e\u2550\u2550", "\u2558\u2550\u2550"],
  };
  static symbols = "ascii-ex";
  static tab = "    ";
  static space = " ";

  static verticalLine(): string {
    return this.treeSymbolOptions[this.symbols][0];
  }

  static tee(): string {
    return this.treeSymbolOptions[this.symbols][0];
  }

  static corner(): string {
    return this.treeSymbolOptions[this.symbols][0];
  }
}

export function treeToStringLoop(nodes: BaseComponent[], spacers: boolean[]) {
  let text = "";

  for (let i = 0; i < nodes.length; i++) {
    //create row
    if (i === nodes.length - 1) {
      text += createRow(nodes[i], spacers, true);
    } else {
      text += createRow(nodes[i], spacers, false);
    }

    if ("nodes" in nodes[i]) {
      if (i === nodes.length - 1) {
        spacers = [...spacers, true];
      } else {
        spacers = [...spacers, false];
      }
      text += treeToStringLoop((nodes[i] as AstContainer<any>).nodes, spacers);
    }
  }

  return text;
}

function createRow(node: BaseComponent, spacers: boolean[], lastNode: boolean) {
  let line = "\n";

  for (const spacer of spacers) {
    if (!spacer) {
      line += TreeConfig.verticalLine();
    }
    line += TreeConfig.tab;
  }

  if (lastNode) {
    line += TreeConfig.corner() + TreeConfig.space;
  } else {
    line += TreeConfig.tee() + TreeConfig.space;
  }

  line += node.print();

  return line;
}
