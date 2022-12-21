import { typeManager } from "../type-mananger";
import * as assert from "assert";

describe("Test typemanger instance", () => {
  it("correctly generates the combined unit regex", () => {
    const regex = typeManager.generateUnitRegex();
    console.log(regex.source);
    assert.equal(regex.source.length, 0);
  });
});
