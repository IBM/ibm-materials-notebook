/**
 * Interface for polymer strategies
 */
export interface PolymerStrategy {
  /**
   * Method for getting a value based on presence or absence of end-groups
   */
  getPsuedoEndGroups(): number;
}

/**
 * Strategy for weighting cyclic polymers
 */
export class CycliStrategy implements PolymerStrategy {
  public getPsuedoEndGroups(): number {
    return 0;
  }
}

/**
 * Strategy for weighting linear strategy
 */
export class LinearStrategy implements PolymerStrategy {
  hasEndCap: boolean = false;
  hasInitiatior: boolean = false;

  public getPsuedoEndGroups(): number {
    if (this.hasEndCap && this.hasInitiatior) {
      return 0;
    } else if (this.hasInitiatior && !this.hasEndCap) {
      return 1;
    } else if (!this.hasInitiatior && !this.hasEndCap) {
      return 2;
    } else {
      throw new Error("Invalid linear strategy state");
    }
  }
}
