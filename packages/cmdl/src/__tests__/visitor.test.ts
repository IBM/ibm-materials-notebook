import { parserInstance } from "../parser";
import { lexerInstance } from "../lexer";
import { CstVisitor } from "../cst-visitor";
import { CmdlAst } from "../cmdl-ast";

const importStatement = `import polymerA from "place";`;

const groupStatement = `
  reaction {
    reaction_temp: 100±2 degC;
  }
`;

const groupWithList = `
  chemical {
    roles: [ "monomer", "catalyst" ];
  }
`;

const refDecGroup = `
  @polymerA.nodeA.fragmentA {
    degree_poly: 38;
  }
`;

const groupWithPropRef = `
  nmr {
    file: @fileRef;
  }
`;

const groupWithRefList = `
  container XYZ {
    nodes: [ @nodeA, @nodeB];
  }
`;

const groupWithAngle = `
  container XYZ {
    <@nodeA.R | @nodeC.Q.R => @nodeB.Q>: 2;
  }
`;

const templateVarText = `
  reaction {
    name: $rxnName;
    reaction_temp: $rxnTemp;
    reaction_volume: $rxnVolume;

    @product {
      roles: ["product"];
    };
  }
`;

const visitor = new CstVisitor();
describe("Tests for cst visitor", () => {
  it("creates an ast from an import statement", () => {
    const lexingResult = lexerInstance.tokenize(importStatement);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);

    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group", () => {
    const lexingResult = lexerInstance.tokenize(groupStatement);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);

    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group with list", () => {
    const lexingResult = lexerInstance.tokenize(groupWithList);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);

    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a reference group", () => {
    const lexingResult = lexerInstance.tokenize(refDecGroup);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group with a reference property", () => {
    const lexingResult = lexerInstance.tokenize(groupWithPropRef);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);
    // console.log(JSON.stringify(ast.print(), null, 2));
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group with template variables", () => {
    const lexingResult = lexerInstance.tokenize(templateVarText);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group with a ref list", () => {
    const lexingResult = lexerInstance.tokenize(groupWithRefList);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    expect(parserInstance.errors.length).toBe(0);
    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);
    // console.log(JSON.stringify(ast.print(), null, 2));
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });

  it("creates an ast from a group with a angle prop", () => {
    const lexingResult = lexerInstance.tokenize(groupWithAngle);
    parserInstance.input = lexingResult.tokens;
    const cst = parserInstance.parseRecord();
    // console.log(JSON.stringify(parserInstance.errors, null, 2));
    expect(parserInstance.errors.length).toBe(0);

    const astBase = new CmdlAst();
    const ast = visitor.visit(cst, astBase);
    expect(ast).toBeTruthy();
    expect(ast).toBeInstanceOf(CmdlAst);
    expect((ast as CmdlAst).root?.children.length).toBe(1);
  });
});
