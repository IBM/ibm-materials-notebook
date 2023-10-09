import { ModelType } from "@ibm-materials/cmdl-types";
import { CmdlToken } from "../cmdl-ast";

/**
 * Interface for CMDL symbol configuraton
 */
export interface SymbolConfig {
  name: string;
  type: SymbolType;
  token: CmdlToken;
  def: string;
}

/**
 * Enum specfiying the different symbol types within CMDL
 */
export enum SymbolType {
  VARIABLE_DEC = "variable_declaration",
  DECLARATION = "declaration",
  IMPORT = "import",
  REFERENCE = "reference",
  PROPERTY = "property",
  REF_PROXY = "ref_proxy",
  REF_PROPERTY = "reference_property",
  REF_LIST_PROP = "reference_list_property",
  VARIABLE_PROP = "variable_property",
  ANGLE_PROPERTY = "angle_property",
  CONNECTION = "connection",
  GROUP = "group",
}

/**
 * Base class for symbols within the experiment
 */
export abstract class BaseSymbol {
  name: string;
  type: SymbolType;
  token: CmdlToken;
  def: string;

  constructor(config: SymbolConfig) {
    this.name = config.name;
    this.token = config.token;
    this.type = config.type;
    this.def = config.def;
  }

  /**
   * Method for printing symbol to console
   */
  abstract print(): string;
}

export class ImportSymbol extends BaseSymbol {
  alias: string | null;
  source: string;
  sourceName: string;

  constructor(
    config: SymbolConfig,
    sourceName: string,
    source: string,
    alias: string | null = null
  ) {
    super(config);
    this.sourceName = sourceName;
    this.source = source;
    this.alias = alias;
  }

  public print(): string {
    return `${this.name}${this.alias ? ` alias: ${this.alias}` : ""}, source: ${
      this.source
    }`;
  }
}

/**
 * Declaration symbols are assigned to declarations of new entities
 * Entities include chemicals, reactors, reactions, solutions, etc.
 */
export class DeclarationSymbol extends BaseSymbol {
  constructor(config: SymbolConfig, public modelType: ModelType) {
    super(config);
  }

  public print(): string {
    return `${this.name} -> ${this.type}, ${this.modelType}`;
  }
}

/**
 * Reference symbols are assigned to references to a declaration symbol within CMDL
 * References are prefixed with an "@"
 */
export class ReferenceSymbol extends BaseSymbol {
  path: string[];
  base: string;
  constructor(config: SymbolConfig, ref: string, path: string[] = []) {
    super(config);
    this.base = ref;
    this.path = path;
  }

  public print(): string {
    return `${this.name} -> ${this.type}`;
  }
}

/**
 * Angle symbols are for defining an edge or edges within polymer graph representations
 * Angle symbols may define one or more edges within a reactor graph
 */
export class AngleSymbol extends BaseSymbol {
  connections: ConnectionSymbol[] = [];

  constructor(config: SymbolConfig) {
    super(config);
  }

  /**
   * Adds a connection symbol to the connections property
   * @param arg ConnectionSymbol
   */
  public addConnection(arg: ConnectionSymbol): void {
    this.connections.push(arg);
  }

  public print(): string {
    return `connections -> ${this.type}`;
  }
}

/**
 * Connection symbols define a single edge connection within a polymer graph representation
 */
export class ConnectionSymbol extends BaseSymbol {
  sources: ReferenceSymbol[];
  targets: ReferenceSymbol[];
  quantity: string;

  constructor(
    config: SymbolConfig,
    sources: ReferenceSymbol[],
    targets: ReferenceSymbol[],
    quantity: string
  ) {
    super(config);
    this.sources = sources;
    this.targets = targets;
    this.quantity = quantity;
  }

  public print(): string {
    return `${this.name} -> ${this.type}`;
  }
}

/**
 * Symbol for group that is not a declaration, e.g. no variable name
 */
export class GroupSymbol extends BaseSymbol {
  constructor(config: SymbolConfig) {
    super(config);
  }
  public print(): string {
    return `${this.name} -> ${this.type}`;
  }
}

/**
 * Symbol for property items within a group
 */
export class PropertySymbol<T> extends BaseSymbol {
  value: T;

  constructor(config: SymbolConfig, value: T) {
    super(config);
    this.value = value;
  }

  public print(): string {
    return `${this.name} ->${this.type}`;
  }
}
