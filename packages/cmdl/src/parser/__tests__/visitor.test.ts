import { parserInstance, lexerInstance } from "..";
import { CSTVisitor } from "../cst-visitor";
import { CMDLAst } from "../../ast";

const importStatement = `import polymerA from "place";`;

const groupStatement = `
  record RxnA : reaction {
    reaction_temp: 100±2 degC;
  }
`;

const groupWithList = `
  record ChemA : chemical {
    aliases: [ "chemA", "CHEM A" ];
  }
`;

const refDecGroup = `
 record GPCA : gpc {
    @polymerA.nodeA.fragmentA {
      degree_poly: 38;
    };
 }
`;

const groupWithPropRef = `
  record NMRA : nmr {
    file: @fileRef;
  }
`;

const groupWithRefList = `
  graph XYZ : polymer {
    nodes: [ @nodeA, @nodeB ];
  }
`;

const groupWithAngle = `
  graph XYZ : polymer {
    <@nodeA.R | @nodeC.Q.R => @nodeB.Q>: 2;
  }
`;

function evaluateCMDLText(text: string) {
  const cstVisitor = new CSTVisitor();
  const ast = new CMDLAst();
  const lexingResult = lexerInstance.tokenize(text);
  parserInstance.input = lexingResult.tokens;
  const cst = parserInstance.parse();
  cstVisitor.visit(cst, ast.getRoot());
  return { errors: parserInstance.errors, ast };
}

describe("Unit tests for cst visitor", () => {
  it("creates an ast from an import statement", () => {
    const { errors, ast } = evaluateCMDLText(importStatement);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a group", () => {
    const { errors, ast } = evaluateCMDLText(groupStatement);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a group with list", () => {
    const { errors, ast } = evaluateCMDLText(groupWithList);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a reference group", () => {
    const { errors, ast } = evaluateCMDLText(refDecGroup);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a group with a reference property", () => {
    const { errors, ast } = evaluateCMDLText(groupWithPropRef);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a group with a ref list", () => {
    const { errors, ast } = evaluateCMDLText(groupWithRefList);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });

  it("creates an ast from a group with a angle prop", () => {
    const { errors, ast } = evaluateCMDLText(groupWithAngle);
    const root = ast.getRoot();
    expect(errors.length).toBe(0);
    expect(root.children.length).toBe(1);
  });
});
