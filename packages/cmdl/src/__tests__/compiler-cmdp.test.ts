import { CellRenderOutput } from "../activation-record-manager";
import { CmdlCompiler } from "../cmdl-compiler";
import { Cell, Notebook } from "../document";
import { protocolText } from "./cmdp-parser.test";

const testCMDPCellText = `# Protocol for TestRxn
${protocolText}`;

const cmdpOnlyCellUri = "cell://cellUri.test";
const cmdpOnlyDocUri = "file://cmdpOnly.cmdnb";
const cmdlRxnCellUri = "cell://cmdlrxn.test";
const cmdlTemplateNBUri = "file://cmdltemplate.test";
const cmdpTemplateURI = "cell://cmdptemplate.test";

const cmdpCell: Cell = {
  text: testCMDPCellText,
  uri: cmdpOnlyCellUri,
  language: "cmdp",
  version: 1,
};

const cmdpOnlyNotebook: Notebook = {
  fileName: "cmdpOnly.cmdnb",
  uri: cmdpOnlyDocUri,
  version: 1,
  cells: [cmdpCell],
};

const reaction = `
chemical THF {
    molecular_weight: 80.1 g/mol;
    density: 0.878 g/ml;
    aliases: [
        "tetrahydrofuran"
    ];
}

chemical KOME {
    molecular_weight: 70.132 g/mol;
    aliases: [
        "potassium methoxide"
    ];
}

chemical lLac {
    molecular_weight: 144.12 g/mol;
    aliases: [
        "L-lactide"
    ];
}

reaction TestReaction {
    temperature: 22 degC;

    @KOME {
        mass: 0.70 mg;
        roles: ["catalyst"];
    };

    @lLac {
        mass: 144 mg;
        roles: ["monomer"];
    };

    @THF {
        volume: 1 ml;
        roles: ["solvent"];
    };
}`;

const cmdlCell: Cell = {
  text: reaction,
  language: "cmdl",
  version: 1,
  uri: cmdlRxnCellUri,
};

const templatedText = `# Protocol for TestRxn[[@TestReaction]]
In a nitrogen filled glovebox a vial was charged with {{@KOME}}, {{@lLac}}, and {{@THF}} and was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR and GPC.`;

const cmdpTemplateCell: Cell = {
  text: templatedText,
  uri: cmdpTemplateURI,
  language: "cmdp",
  version: 1,
};

const fullNotebook: Notebook = {
  fileName: "cmdpandcmdl.cmdnb",
  uri: cmdlTemplateNBUri,
  version: 1,
  cells: [cmdlCell, cmdpTemplateCell],
};

const templatedHTML =
  "<h1>Protocol for TestRxn</h1>\n<p>In a nitrogen filled glovebox a vial was charged with potassium methoxide (0.7 mg, 9.9812 mcmol, 1 equiv.), L-lactide (144 mg, 0.9992 mmol, 100.11 equiv.), and tetrahydrofuran (1 ml) and was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR and GPC.</p>\n";

const basicHTML =
  "<h1>Protocol for TestRxn</h1>\n<p>In a nitrogen filled glovebox a vial was charged with Potassium_Methoxide, CF3-4-U, and THF. A separate vial was charged with TMC-tBu and THF. 0.05 ml of the catalyst solution was added to a third vial equipped with a stir-bar and stirred vigorously. 0.2 ml of the monomer solution was then added and the reaction was stirred at room temperature for 5 s. The reaction was quenched with a solution of excess benzoic acid in THF. An aliquot was removed and analyzed by 1H NMR CC1812-A-gpc and GPC CC1812-A-gpc</p>\n";

describe("Integration tests for CMDP parsing with CMDL compiler", () => {
  it("returns HTML if cell has no CMDL refs or links", () => {
    const compiler = new CmdlCompiler();
    compiler.register(cmdpOnlyNotebook);
    const output = compiler.execute(cmdpOnlyDocUri, cmdpOnlyCellUri);
    expect(typeof output === "string").toBeTruthy();
    expect(output).toBe(basicHTML);
  });

  it("generates protocol strings from CMDP links and refs", () => {
    const compiler = new CmdlCompiler();
    compiler.register(fullNotebook);
    const cmdlCellOutput = compiler.execute(cmdlTemplateNBUri, cmdlRxnCellUri);
    expect(typeof cmdlCellOutput === "string").not.toBeTruthy();
    expect((cmdlCellOutput as CellRenderOutput).chemicals.length).toBe(3);
    expect((cmdlCellOutput as CellRenderOutput).reactions.length).toBe(1);
    const cmdpCellOutput = compiler.execute(cmdlTemplateNBUri, cmdpTemplateURI);
    expect(typeof cmdpCellOutput === "string").toBeTruthy();
    expect(cmdpCellOutput).toBe(templatedHTML);
  });
});
