import { Library } from "../library";

const filePath = "/Users/npark/ibm-materials-notebook/examples/lib/thf.json";
describe("Tests for in-memory library", () => {
  it("successfull parses a json file", async () => {
    const lib = new Library();
    await lib.initLibrary(filePath, "lib");
    expect(lib.getItem("THF")).toBeTruthy();
  });
});
