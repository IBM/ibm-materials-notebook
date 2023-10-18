import { TAGS, TYPES } from "@ibm-materials/cmdl-types";
import { Entity } from "./entity";

export class ProtocolEntity extends Entity<any> {
  private refMap: Record<string, string> = {}; //reverse mapping of references
  private references: Record<string, { name: string; value: string }> = {};
  private protocol: string[] = [];

  get protocolRefs() {
    return this.references;
  }

  public initializeProtocol(
    protocol: string[],
    references: { name: string; image: string }[]
  ): void {
    this.protocol = [...protocol];

    for (const ref of references) {
      this.references[ref.image] = { name: ref.name, value: "" };
      this.refMap[ref.name] = ref.image;
    }
  }

  public export() {
    return {
      protocol: [...this.protocol],
      references: Object.values(this.references),
      name: this.name,
      type: this.type,
    };
  }

  /**
   * Serializes protocol template to string given
   * refrence values
   * TODO: allow checking if next item after a reference insertion is not punctuation, add space if not...
   * @returns string
   */
  public serializeProtocol(): string {
    return this.protocol
      .map((item) => {
        if (item in this.references) {
          return this.references[item].value;
        } else {
          return item;
        }
      })
      .join("");
  }

  public extractReferences(refArr: TYPES.ChemicalOutput[]) {
    for (const ref of refArr) {
      const refKey = this.refMap[ref.name];
      if (refKey) {
        let refStr;
        if (ref.roles.includes(TAGS.SOLVENT)) {
          refStr = `${ref.name} (${ref.mass.value} ${ref.mass.unit})`;
        } else {
          refStr = `${ref.name} (${ref.mass.value} ${ref.mass.unit}, ${ref.moles.value} ${ref.moles.unit}, ${ref.ratio} equiv.)`;
        }
        this.references[refKey].value = refStr;
      }
    }
  }
}
