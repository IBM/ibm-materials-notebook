import { ModelType } from "../../cmdl-types/groups/group-types";
import { CmdlToken } from "../../composite-tree-visitor";

export interface SymbolConfig {
  name: string;
  type: SymbolType;
  token: CmdlToken;
  def: string;
}

export enum SymbolType {
  VARIABLE_DEC = "variable_declaration",
  DECLARATION = "declaration",
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
 * Class for symbols within the experiment
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

  abstract print(): string;
}

export class DeclarationSymbol extends BaseSymbol {
  aliasedName: string | null = null;
  constructor(
    config: SymbolConfig,
    public modelType: ModelType,
    aliasedName?: string
  ) {
    super(config);
    if (aliasedName) {
      this.aliasedName = aliasedName;
    }
  }

  public print() {
    return `${this.name} -> ${this.type}, ${this.modelType}`;
  }
}

export class ReferenceSymbol extends BaseSymbol {
  path: string[];
  base: string;
  constructor(config: SymbolConfig, ref: string, path: string[] = []) {
    super(config);
    this.base = ref;
    this.path = path;
  }

  public print() {
    return `${this.name} -> ${this.type}`;
  }
}

export class AngleSymbol extends BaseSymbol {
  connections: ConnectionSymbol[] = [];
  constructor(config: SymbolConfig) {
    super(config);
  }

  addConnection(arg: ConnectionSymbol) {
    this.connections.push(arg);
  }
  print() {
    return `connections -> ${this.type}`;
  }
}

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

  public print() {
    return `${this.name} -> ${this.type}`;
  }
}

export class GroupSymbol extends BaseSymbol {
  constructor(config: SymbolConfig) {
    super(config);
  }
  public print() {
    return `${this.name} -> ${this.type}`;
  }
}

export class PropertySymbol<T> extends BaseSymbol {
  value: T;
  constructor(config: SymbolConfig, value: T) {
    super(config);
    this.value = value;
  }

  public print() {
    return `${this.name} ->${this.type}`;
  }
}
