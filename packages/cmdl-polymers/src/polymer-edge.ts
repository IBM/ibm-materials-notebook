import { JSONPolymerConnection } from "./polymer-container";
import {
  PolymerTreeVisitor,
  EdgeWeightor,
  StrategyVisitor,
  SideChainVisitor,
  EdgeMultiplier,
} from "./polymer-visitors";

/**
 * Class for edges within a polymer graph.
 * Maintains information about absolute paths of sources, targets, weights, and quantities for edge
 */
export class PolymerEdge {
  sourcePath: string[]; //full path string
  targetPath: string[]; //full path string
  sourceName: string;
  targetName: string;
  sourcePoint: string; //Q
  targetPoint: string; //R
  weight: number;
  quantity: number; //number of duplicates
  edgeAmount?: number; //base weight for edge for tabulation ex. 0 or 1 for base unimolecular --> 50

  constructor({
    sourcePath,
    targetPath,
    weight,
    quantity,
  }: {
    sourcePath: string[];
    targetPath: string[];
    weight: number;
    quantity: number;
  }) {
    this.sourcePath = sourcePath;
    this.targetPath = targetPath;
    this.sourceName = this.createName(sourcePath);
    this.targetName = this.createName(targetPath);
    this.sourcePoint = this.getPoint(sourcePath);
    this.targetPoint = this.getPoint(targetPath);
    this.weight = weight;
    this.quantity = quantity;
  }

  /**
   * Parses absolute path to create a name without a connection point (R, Q, Z, X) for a source or target.
   * @param arr string[]
   * @returns string
   */
  private createName(arr: string[]): string {
    return arr.slice(0, -1).join(".");
  }

  /**
   * Returns the connection point (last element) from a connection path
   * @param path string[]
   * @returns string
   */
  private getPoint(path: string[]): string {
    if (!path || !path.length) {
      throw new Error(`unable to get point from empty path`);
    }
    return path[path.length - 1];
  }

  /**
   * Retrieves the edge target's group
   * @returns string
   */
  public getTargetGroup(): string {
    if (this.targetPath.length >= 3) {
      return this.targetPath[this.targetPath.length - 3];
    } else {
      // logger.warn(`Target Path ${this.targetPath.join(".")} is weirdly short!`);
      return this.targetPath[0];
    }
  }

  /**
   * Retrieves the edge source's group
   * @returns string
   */
  public getSourceGroup(): string {
    if (this.sourcePath.length >= 3) {
      return this.sourcePath[this.sourcePath.length - 3];
    } else {
      // logger.warn(`Source Path ${this.sourcePath.join(".")} is weirdly short!`);
      return this.sourcePath[0];
    }
  }

  /**
   * Converts parsed node paths to absolute paths within the polymer tree
   * @param path string[]
   */
  public mergeBasePath(path: string[]): void {
    this.sourcePath = [...path, ...this.sourcePath];
    this.targetPath = [...path, ...this.targetPath];
    this.sourceName = this.createName(this.sourcePath);
    this.targetName = this.createName(this.targetPath);
  }

  /**
   * Serializes to more concise representation with masked paths
   * @TODO remove pipe separator
   * @param maskMap Map<string, string>
   * @returns string
   */
  public toMaskedString(maskMap: Map<string, string>): string {
    let target = maskMap.get(this.targetName);

    if (!target) {
      // logger.warn(
      //   `unable to find target node: ${this.targetName} in mask map!`
      // );
    }

    return `<edge>${this.sourcePoint} -> ${target || this.targetName}.${
      this.targetPoint
    }|${this.weight}|${this.quantity}`;
  }

  /**
   * Serializes to more concise representation with masked paths
   * @param maskMap Map<string, string>
   * @returns string
   */
  public toCompressedString(maskMap: Map<string, string>): string {
    let target = maskMap.get(this.targetName);
    let source = maskMap.get(this.sourceName);

    if (!target || !source) {
      // logger.warn(
      //   `unable to find target node ${this.targetName} or source node ${this.sourceName} in mask map!`
      // );
    }

    return `${source}.${this.sourcePoint} -> ${target || this.targetName}.${
      this.targetPoint
    }`;
  }

  /**
   * Serializes to a string for exporting
   * @TODO remove pipe separator
   * @returns string
   */
  public toString(): string {
    return `<edge>${this.sourcePoint} -> ${this.targetName}.${this.targetPoint}|${this.weight}|${this.quantity}`;
  }

  /**
   * Converts to Object for export
   * @TODO fix unnecessary type conversion
   * @returns Object
   */
  public toJSON(): JSONPolymerConnection {
    return {
      source: this.sourcePath.join("."),
      target: this.targetPath.join("."),
      weight: this.weight,
      quantity: String(this.quantity),
    };
  }

  /**
   * Serializes polymer graph edge to a string for
   * printing to the console
   * @returns string
   */
  public print(): string {
    let source = this.sourcePath.join(".");
    let target = this.targetPath.join(".");

    return `<${source} => ${target}>: ${this.quantity};\n`;
  }

  /**
   * Accepts a polymer tree visitor for computing
   * weights on the polymer nodes
   * @param visitor PolymerTreeVisitor
   */
  public accept(visitor: PolymerTreeVisitor): void {
    if (visitor instanceof EdgeWeightor) {
      visitor.visitEdge(this);
    } else if (visitor instanceof EdgeMultiplier) {
      visitor.visitEdge(this);
    } else if (visitor instanceof StrategyVisitor) {
      visitor.visitEdge(this);
    } else if (visitor instanceof SideChainVisitor) {
      visitor.visitEdge(this);
    }
  }
}
