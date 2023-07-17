import { TAGS, TYPES } from "cmdl-types";
import { logger } from "../../logger";
import { Model } from "./model";

export class ProtocolModel extends Model<any> {
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
