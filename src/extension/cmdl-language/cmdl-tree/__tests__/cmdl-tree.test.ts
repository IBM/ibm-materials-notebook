import {
  DuplicationError,
  ErrorCode,
  FileError,
  InvalidGroupError,
  InvalidPropertyError,
  ParserError,
  RefError,
} from "../../errors";
import { Library } from "../../../library";
import { CmdlCompiler } from "../../cmdl-compiler";
import { CmdlTree } from "../cmdl-tree";

const compiler = new CmdlCompiler();
const library = new Library();

describe("Tests for tree construction and compiler parser errors", () => {
  it("creates parser errors on invalid text", () => {
    const parserErrorText = `
      import THF from "./__tests__/thf.json";
      reaction ABC {
          temperature: 100 degC;
          pH: 10±2.3
          
          @THF {
              mass: 200 g;
          };
      }

      solution DEF {
          @THF {
              volume: 200 dal;
          };
      }`;

    const { parserErrors } = compiler.parse(parserErrorText);
    expect(parserErrors.length).toBe(1);
    expect(parserErrors[0]).toBeInstanceOf(ParserError);
    expect(parserErrors[0].code).toBe(ErrorCode.MismatchedTokenException);
  });
});

describe("Tests for compiler validation errors", () => {
  it(`compiles a valid record`, async () => {
    const validText = `
      reaction ABC {
          volume: 200 ml;
          temperature: 100 degC;

          @TEA {
            volume: 20 mcl;
          };
          
          @THF {
              mass: 200 g;
          };
      }

      solution DEF {
          @THF {
              volume: 200 dal;
          };
      }`;

    let { parserErrors, recordTree } = compiler.parse(validText);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(0);
    expect(recordTree).toBeInstanceOf(CmdlTree);
  });

  it(`identifies an invalid property`, async () => {
    const text = `
      reaction ABC {
          temperature: 100 degC;
          pH: 10±2.3;
          
          @THF {
              mass: 200 g;
          };
      }

      solution DEF {
          @THF {
              volume: 200 dal;
          };
      }`;

    const { recordTree, parserErrors } = compiler.parse(text);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidPropertyError);
    expect(errors[0].code).toBe(ErrorCode.InvalidProperty);
  });

  it(`identifies an duplicate property`, async () => {
    const duplicatePropText = `
    reaction ABC {
        temperature: 100 degC;
        
        @THF {
            mass: 200 g;
        };

        @THF {
            volume: 200 ml;
        };
    }`;

    const { recordTree, parserErrors } = compiler.parse(duplicatePropText);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(DuplicationError);
    expect(errors[0].code).toBe(ErrorCode.DuplicateItem);
  });

  it(`creates a file error for invalid path`, async () => {
    const fileErrorTxt = `
      import THF from "./path/to/thf.json";
      reaction ABC {
          temperature: 100 degC;
          
          @THF {
              mass: 200 g;
          };
      }`;

    let { parserErrors, recordTree } = compiler.parse(fileErrorTxt);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(FileError);
    expect(errors[0].code).toBe(ErrorCode.FileNotFound);
  });

  it(`recognizes invalid group nesting`, async () => {
    const invalidNestingText = `
      sample abc-I-123 {
        @THF {
              conversion: 20 %;

            @THF {
              volume: 200 ml;
            };
          };
      }`;

    let { parserErrors, recordTree } = compiler.parse(invalidNestingText);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidGroupError);
    expect(errors[0].code).toBe(ErrorCode.InvalidGroup);
  });

  it(`recognizes a list property with an improper value`, async () => {
    const badListProp = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }

      reaction XYZ {
        @THF {
          volume: 2 ml;
          roles: ["magic"];
        };
      }
    `;
    let { parserErrors, recordTree } = compiler.parse(badListProp);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidPropertyError);
    expect(errors[0].code).toBe(ErrorCode.InvalidProperty);
  });

  it(`recognizes a reference group with a missing name and creates an error`, async () => {
    const missingNameRef = `
      chemical {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
        state: "liquid";
      }
    `;

    let { parserErrors, recordTree } = compiler.parse(missingNameRef);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidGroupError);
    expect(errors[0].code).toBe(ErrorCode.InvalidGroup);
  });

  it.skip(`recognizes missing refs from import`, async () => {
    const refErrorTxt = `
    import TFA from "./__tests__/thf.json";
    reaction ABC {
        temperature: 100 degC;
        
        @THF {
            mass: 200 g;
        };
    }`;

    let { parserErrors, recordTree } = compiler.parse(refErrorTxt);
    const errors = await recordTree.validate(library);

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(RefError);
    expect(errors[0].code).toBe(ErrorCode.ReferenceError);
  });
});
