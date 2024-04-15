import { SymbolTableBuilder } from "../symbol-table-builder";
import { SymbolTable } from "../symbol-table";
import { ErrorTable } from "../../errors";

describe("Unit tests for symbol table builder functions", () => {
  it("initializes correctly", () => {
    const globalTable = new SymbolTable("GLOBAL", "test/uri");
    const errs = new ErrorTable();
    const builder = new SymbolTableBuilder(globalTable, errs, "test/uri");

    expect(builder.uri).toBe("test/uri");
    expect(builder.errors).toEqual(errs);
  });
});
