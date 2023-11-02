import {
  DuplicationError,
  ErrorCode,
  InvalidGroupError,
  InvalidPropertyError,
  RefError,
} from "../../errors";
import { CmdlParser } from "../../cmdl-parser";
import { CmdlTree } from "../cmdl-tree";
import { logger } from "../../logger";

const compiler = new CmdlParser();

describe("Tests for compiler validation errors", () => {
  it(`compiles a valid record`, () => {
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

    const { parserErrors, recordTree } = compiler.parse(validText);
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(0);
    expect(recordTree).toBeInstanceOf(CmdlTree);
  });

  it(`identifies an invalid property`, () => {
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
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidPropertyError);
    expect(errors[0].code).toBe(ErrorCode.InvalidProperty);
  });

  it.skip(`identifies an duplicate property`, () => {
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
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(DuplicationError);
    expect(errors[0].code).toBe(ErrorCode.DuplicateItem);
  });

  it(`recognizes invalid group nesting`, () => {
    const invalidNestingText = `
      char_data abc-I-123 {
        technique: "nmr";
        sample_id: "123-abc";

        @THF {
              conversion: 20 %;

            @THF {
              volume: 200 ml;
            };
          };
      }`;

    const { parserErrors, recordTree } = compiler.parse(invalidNestingText);
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    logger.debug(JSON.stringify(errors, null, 2));
    expect(errors.length).toBe(2);

    expect(errors[0]).toBeInstanceOf(InvalidGroupError);
    expect(errors[0].code).toBe(ErrorCode.InvalidGroup);
  });

  it(`recognizes a list property with an improper value`, () => {
    const badListProp = `
      chemical THF {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
      }

      reaction XYZ {
        @THF {
          volume: 2 ml;
          roles: ["magic"];
        };
      }
    `;
    const { parserErrors, recordTree } = compiler.parse(badListProp);
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidPropertyError);
    expect(errors[0].code).toBe(ErrorCode.InvalidProperty);
  });

  it(`recognizes a reference group with a missing name and creates an error`, () => {
    const missingNameRef = `
      chemical {
        molecular_weight: 80.1 g/mol;
        density: 0.878 g/ml;
      }
    `;

    const { parserErrors, recordTree } = compiler.parse(missingNameRef);
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(InvalidGroupError);
    expect(errors[0].code).toBe(ErrorCode.InvalidGroup);
  });

  it.skip(`recognizes missing refs from import`, () => {
    const refErrorTxt = `
    import TFA from "./__tests__/thf.json";
    reaction ABC {
        temperature: 100 degC;
        
        @THF {
          mass: 200 g;
        };
    }`;

    const { parserErrors, recordTree } = compiler.parse(refErrorTxt);
    const errors = recordTree.validate();

    expect(parserErrors.length).toBe(0);
    expect(errors.length).toBe(1);
    expect(errors[0]).toBeInstanceOf(RefError);
    expect(errors[0].code).toBe(ErrorCode.ReferenceError);
  });
});
