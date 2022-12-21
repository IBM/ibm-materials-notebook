import { CmdlCompiler } from "../cmdl-compiler";

describe("Tests for cmdl-ast for completion providers", () => {
  const compiler = new CmdlCompiler();

  it("returns a null value when no nearby groups", () => {
    const text = `reaction`;
    const { ast } = compiler.parseAST(text);

    const node = ast.findNearestGroup();

    expect(node).not.toBeTruthy();
  });

  it("returns the nearest group", () => {
    const text = `reaction ABC {
        test1
    }`;
    const { ast, parserErrors } = compiler.parseAST(text);

    const node = ast.findNearestGroup();

    expect(parserErrors.length).toBeGreaterThan(0);
    expect(node).toBeTruthy();
    expect(node?.parent?.image).toBe("reaction");
  });

  it("returns the nearest group for a nested value", () => {
    const text = `reaction ABC {
        test1 {
            test2
        };
    }`;
    const { ast, parserErrors } = compiler.parseAST(text);
    const node = ast.findNearestGroup();

    console.log(node?.print());
    expect(parserErrors.length).toBeGreaterThan(0);
    expect(node).toBeTruthy();
    expect(node?.parent?.image).toBe("test1");
  });

  it("returns nearest group with multiple other values", () => {
    const text = `reaction ABC {
        test1: 100;
        test2 {
            test3: 100;
        };
        te
    }`;
    const { ast, parserErrors } = compiler.parseAST(text);
    const node = ast.findNearestGroup();

    expect(parserErrors.length).toBeGreaterThan(0);
    expect(node).toBeTruthy();
    expect(node?.parent?.image).toBe("reaction");
  });

  it("returns the nearst group with multiple reference groups", () => {
    const text = `reaction ABC {
        prop1: 100;
        pr

        @test2 {
            prop2: 100;
        };

        @test3 {
            prop3: 100;
        };
    }`;
    const { ast, parserErrors } = compiler.parseAST(text);
    const node = ast.findNearestGroup();

    console.log(JSON.stringify(ast.print(), null, 2));
    expect(parserErrors.length).toBeGreaterThan(0);
    expect(node).toBeTruthy();
    expect(node?.parent?.image).toBe("reaction");
  });
});
