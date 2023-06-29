import { IUnit, allUnits } from "./units";
import { IProperty, allProperties } from "./properties";
import { IGroup, allGroups } from "./groups";
import { IAction, allActions } from "./actions";
import { ITag, allTags } from "./tags";
// import { ITemplates } from "./templates";
import { UNITS } from "./units";

/**
 * Provides interface for all CMDL types
 * TODO: convert to singleton with private constructor
 */
export class TypeManager {
  private UNITS = new Map<string, IUnit>();
  private PROPERTIES = new Map<string, IProperty>();
  private GROUPS = new Map<string, IGroup>();
  private TAGS = new Map<string, ITag>();
  private ACTIONS = new Map<string, IAction>();
  // private TEMPLATES = new Map<string, ITemplates>();

  private readonly volumeQtyUnitMap = new Map<string, string>([
    [UNITS.PL, UNITS.NG],
    [UNITS.NL, UNITS.MCG],
    [UNITS.MCL, UNITS.MG],
    [UNITS.ML, UNITS.G],
    [UNITS.L, UNITS.KG],
    [UNITS.KL, UNITS.M_G],
    [UNITS.NG, UNITS.PL],
    [UNITS.MCG, UNITS.NL],
    [UNITS.MG, UNITS.MCL],
    [UNITS.G, UNITS.ML],
    [UNITS.KG, UNITS.L],
    [UNITS.M_G, UNITS.KL],
  ]);

  private readonly molQtyUnitMap = new Map<string, string>([
    [UNITS.NG, UNITS.NMOL],
    [UNITS.MCG, UNITS.MCMOL],
    [UNITS.MG, UNITS.MMOL],
    [UNITS.G, UNITS.MOL],
    [UNITS.KG, UNITS.KMOL],
    [UNITS.NMOL, UNITS.NG],
    [UNITS.MCMOL, UNITS.MCG],
    [UNITS.MMOL, UNITS.MG],
    [UNITS.MOL, UNITS.G],
    [UNITS.KMOL, UNITS.KG],
  ]);

  constructor(
    units: IUnit[],
    props: IProperty[],
    groups: IGroup[],
    tags: ITag[],
    actions: IAction[]
    // templates: ITemplates[]
  ) {
    this.initializeUnits(units);
    this.initializeProperties(props);
    this.initializeGroups(groups);
    this.initializeTags(tags);
    this.initializeActions(actions);
    // this.initializeTemplates(templates);
  }

  private initializeUnits(arr: IUnit[]) {
    arr.forEach((unit) => this.UNITS.set(unit.symbol, unit));
  }
  private initializeProperties(arr: IProperty[]) {
    arr.forEach((prop) => this.PROPERTIES.set(prop.name, prop));
  }
  private initializeGroups(arr: IGroup[]) {
    arr.forEach((prop) => this.GROUPS.set(prop.name, prop));
  }
  private initializeTags(arr: ITag[]) {
    arr.forEach((prop) => this.TAGS.set(prop.name, prop));
  }
  private initializeActions(arr: IAction[]) {
    arr.forEach((prop) => this.ACTIONS.set(prop.name, prop));
  }
  // private initializeTemplates(arr: ITemplates[]) {
  //   arr.forEach((prop) => this.TEMPLATES.set(prop.name, prop));
  // }

  /**
   * constructs a regular expression for all units
   * @deprecated
   * @returns RegExp
   */
  public generateUnitRegex() {
    let unitKeys = [...this.UNITS.keys()];
    let regexString = unitKeys
      .sort((a, b) => b.length - a.length)
      .reduce((acc, curr) => {
        let currUnit = this.UNITS.get(curr);

        if (!currUnit) {
          return acc;
        }

        let unitRegex = currUnit.regex.source;

        if (!acc.length) {
          return `${unitRegex}`;
        }

        acc = `${acc}|${unitRegex}`;
        return acc;
      }, "");

    return new RegExp(regexString);
  }

  public searchGroups(query: string) {
    const regex = new RegExp(query, "i");

    const keys = [...this.GROUPS.keys()];
    const groupResults = keys
      .filter((key) => regex.test(key))
      .map((el) => this.GROUPS.get(el))
      .filter(this.isGroup);

    return [...groupResults];
  }

  public searchProperties(query: string) {
    const regex = new RegExp(query, "i");

    const keys = [...this.PROPERTIES.keys()];
    const propertyResults = keys
      .filter((key) => regex.test(key))
      .map((el) => this.PROPERTIES.get(el))
      .filter(this.isProperty);

    return [...propertyResults];
  }

  public isProperty(arg: IProperty | undefined): arg is IProperty {
    return !!arg;
  }

  public isGroup(arg: IGroup | undefined): arg is IGroup {
    return !!arg;
  }

  public getUnit(key: string) {
    const unit = this.UNITS.get(key);
    return unit;
  }

  public getProperty(key: string) {
    const property = this.PROPERTIES.get(key);
    return property;
  }

  public getGroup(key: string) {
    const group = this.GROUPS.get(key);
    return group;
  }

  // public getTempate(key: string) {
  //   return this.TEMPLATES.get(key);
  // }

  public getModel(key: string) {
    const group = this.GROUPS.get(key);

    if (!group) {
      throw new Error(`${key} is not a recognized group`);
    }

    if (!group?.modelType) {
      throw new Error(`${key} has no model type`);
    }

    return group.modelType;
  }

  public getVolToMass(key: string) {
    let unit = this.volumeQtyUnitMap.get(key);
    if (unit) {
      return unit;
    } else {
      throw new Error(`Qty unit ${key} is not acceptable reagents`);
    }
  }
  public getMolToMass(key: string) {
    let unit = this.molQtyUnitMap.get(key);
    if (unit) {
      return unit;
    } else {
      throw new Error(`Qty unit ${key} is not acceptable reagents`);
    }
  }
}

export const typeManager = new TypeManager(
  allUnits,
  allProperties,
  allGroups,
  allTags,
  allActions
  // allTemplates
);
