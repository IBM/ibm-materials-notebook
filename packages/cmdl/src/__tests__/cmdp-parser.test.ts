import { CMDPParser } from "../protocol-markdown";
import { ActivationRecordTable } from "../intepreter";
import { TAGS, TYPES } from "../cmdl-types";
import { CmdlCompiler } from "../cmdl-compiler";

export const protocolText = `In a nitrogen filled glovebox a vial was charged with Potassium_Methoxide, CF3-4-U, and THF. A separate vial was charged with TMC-tBu and THF. 0.05 ml of the catalyst solution was added to a third vial equipped with a stir-bar and stirred vigorously. 0.2 ml of the monomer solution was then added and the reaction was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR CC1812-A-gpc and GPC CC1812-A-gpc`;

const charProtocolText = `Removed aliquot solvent under stream of N2 gas. Dissolved residue in CDCl3 and transferred to NMR tube. Analyzed 1H NMR spectrum.`;

const testMarkdown = `
# Protocol

${protocolText}
`;

const testMarkdownHTML = `<h1>Protocol</h1>\n<p>${protocolText}</p>\n`;

const testReactionEntity = `TestRxn`;
const testCharData = `TestChar`;

const markdownCMDP = `
# Protocol[[@${testReactionEntity}]]
${protocolText}
`;
const parsedMdCMDP = `Protocol
${protocolText}`;

const multiCMDP = `
# Protocol[[@${testReactionEntity}]]
${protocolText}
# Protocol[[@${testCharData}]]
${charProtocolText}
`;

const charString = `Protocol\n${charProtocolText}`;

const THF: TYPES.ReactionChemicalOutput = {
  name: "THF",
  density: 0.87,
  mw: 74.0,
  mass: {
    value: 1,
    unit: "g",
    uncertainty: null,
  },
  volume: {
    value: 0.87,
    unit: "ml",
    uncertainty: null,
  },
  moles: {
    value: 13.51,
    unit: "mmol",
    uncertainty: null,
  },
  roles: [TAGS.SOLVENT],
  limiting: false,
  ratio: 10.0,
  pressure: null,
  molality: {
    value: 1.1,
    unit: "mol/kg",
    uncertainty: null,
  },
  molarity: {
    value: 1.13,
    unit: "mol/l",
    uncertainty: null,
  },
  moles_vol: {
    value: 1.0,
    unit: "mol/l",
    uncertainty: null,
  },
  entity: {
    name: "THF",
    smiles: "C1COCC1",
    aliases: ["tetrahydrofuran"],
  },
};

const templatedProtocol = `
# Protocol[[@${testReactionEntity}]]
In a nitrogen filled glovebox a vial was charged with Potassium_Methoxide, CF3-4-U, and {{@THF}}. A separate vial was charged with TMC-tBu and THF. 0.05 ml of the catalyst solution was added to a third vial equipped with a stir-bar and stirred vigorously. 0.2 ml of the monomer solution was then added and the reaction was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR CC1812-A-gpc and GPC CC1812-A-gpc
`;

const templatedHTMLOutput = `<h1>Protocol</h1>\n<p>In a nitrogen filled glovebox a vial was charged with Potassium_Methoxide, CF3-4-U, and tetrahydrofuran (0.87 ml). A separate vial was charged with TMC-tBu and THF. 0.05 ml of the catalyst solution was added to a third vial equipped with a stir-bar and stirred vigorously. 0.2 ml of the monomer solution was then added and the reaction was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR CC1812-A-gpc and GPC CC1812-A-gpc</p>\n`;

describe("Unit tests for CMDP parsing", () => {
  it("parses markdown without references and returns HTML", () => {
    const compiler = new CmdlCompiler();
    const lookup = jest
      .spyOn(compiler, "getFileAR")
      .mockImplementation((arg: string) => new ActivationRecordTable(arg));
    const parser = new CMDPParser(compiler);
    const output = parser.parse(testMarkdown, "test.cmdnb");
    expect(lookup).toHaveBeenCalled();
    expect(Object.keys(output.protocolStrings).length).toBe(0);
    expect(output.html).toEqual(testMarkdownHTML);
  });

  it("throws an error if CMDL reference is missing a value in the AR", () => {
    const compiler = new CmdlCompiler();
    const lookup = jest
      .spyOn(compiler, "getFileAR")
      .mockImplementation((arg: string) => new ActivationRecordTable(arg));
    const parser = new CMDPParser(compiler);
    expect(() => parser.parse(markdownCMDP, "test.cmdnb")).toThrow(
      "Unable to locate TestRxn"
    );
    expect(lookup).toHaveBeenCalled();
  });

  it("successfull parses markdown with CMDL reference", () => {
    const compiler = new CmdlCompiler();
    const lookup = jest
      .spyOn(compiler, "getFileAR")
      .mockImplementation((arg: string) => new ActivationRecordTable(arg));
    const parser = new CMDPParser(compiler);
    const entities = jest
      .spyOn(parser as any, "extractReactionEntities")
      .mockImplementation(() => {});
    const output = parser.parse(markdownCMDP, "test.cmdnb");
    expect(lookup).toHaveBeenCalled();
    expect(entities).toHaveBeenCalled();
    expect(output.protocolStrings[testReactionEntity]).toBeTruthy();
    expect(output.protocolStrings[testReactionEntity]).toBe(
      parsedMdCMDP.trim()
    );
    expect(output.html).toBe(testMarkdownHTML);
  });

  it("parses a string with multiple protocols", () => {
    const compiler = new CmdlCompiler();
    const lookup = jest
      .spyOn(compiler, "getFileAR")
      .mockImplementation((arg: string) => new ActivationRecordTable(arg));
    const parser = new CMDPParser(compiler);
    const entities = jest
      .spyOn(parser as any, "extractReactionEntities")
      .mockImplementation(() => {});
    const output = parser.parse(multiCMDP, "test.cmdnb");
    expect(lookup).toHaveBeenCalled();
    expect(entities).toHaveBeenCalled();
    expect(output.protocolStrings[testReactionEntity]).toBeTruthy();
    expect(output.protocolStrings[testCharData]).toBeTruthy();
    expect(output.protocolStrings[testCharData]).toBe(charString);
  });

  it("correctly templates a reagent in a protocol", () => {
    const compiler = new CmdlCompiler();
    const lookup = jest
      .spyOn(compiler, "getFileAR")
      .mockImplementation((arg: string) => new ActivationRecordTable(arg));
    const parser = new CMDPParser(compiler);
    const entities = jest
      .spyOn(parser as any, "extractReactionEntities")
      .mockImplementation(() => ({
        THF,
      }));
    const output = parser.parse(templatedProtocol, "test.cmdnb");
    expect(lookup).toHaveBeenCalled();
    expect(entities).toHaveBeenCalled();
    expect(output.protocolStrings[testReactionEntity]).toBeTruthy();
    expect(output.html).toBe(templatedHTMLOutput);
  });
});
