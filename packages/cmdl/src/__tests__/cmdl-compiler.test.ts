import { CellRenderOutput } from "../activation-record-manager";
import { CmdlCompiler } from "../cmdl-compiler";
import { Notebook, NotebookDocument, Text, TextDocument } from "../document";
import {
  notebook1,
  notebook2,
  notebook3,
  cmdlChemicals,
  polymerGraphs,
} from "../mocks/mock-cmdl-files";

const cmdlChemDoc: Text = {
  uri: "file://chemicals.cmdl",
  fileName: "chemicals.cmdl",
  version: 1,
  text: cmdlChemicals,
};

const cmdlPolyGraphDoc: Text = {
  uri: "file://polymerGraphs.cmdl",
  fileName: "polymer_graphs.cmdl",
  version: 1,
  text: polymerGraphs,
};

const cmdlNotebook1: Notebook = {
  uri: "file://notebook1.cmdnb",
  fileName: "notebook1.cmdnb",
  version: 1,
  cells: notebook1.cells.map((el, index) => ({
    uri: `cell://notebook1-cell-${index}`,
    language: el.language,
    version: 1,
    text: el.value,
  })),
};
const cmdlNotebook2: Notebook = {
  uri: "file://notebook2.cmdnb",
  fileName: "notebook2.cmdnb",
  version: 1,
  cells: notebook2.cells.map((el, index) => ({
    uri: `cell://notebook2-cell-${index}`,
    language: el.language,
    version: 1,
    text: el.value,
  })),
};
const cmdlNotebook3: Notebook = {
  uri: "file://notebook3.cmdnb",
  fileName: "notebook3.cmdnb",
  version: 1,
  cells: notebook3.cells.map((el, index) => ({
    uri: `cell://notebook3-cell-${index}`,
    language: el.language,
    version: 1,
    text: el.value,
  })),
};

const exampleInputResults = [
  {
    time_point: {
      value: 20,
      unit: "s",
      uncertainty: null,
    },
    sample_id: "CC1865-A",
    source: "CC1865-rxn",
    conversion: [
      {
        value: 5,
        unit: "%",
        uncertainty: null,
        technique: "nmr",
        source: "CC1865-A",
      },
    ],
    name: "Bn-DOA",
    entity: {
      molecular_weight: {
        value: 221.11,
        unit: "g/mol",
        uncertainty: null,
      },
      smiles: "O=C1OCCN(CC2=CC=CC=C2)CCO1",
      aliases: ["6-benzyl-1,3,6-dioxazocan-2-one"],
      name: "Bn-DOA",
    },
  },
];

describe("Integration tests for CMDL compiler", () => {
  describe("document registration tests", () => {
    it("registers a CMDL document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const doc = compiler.getDocument(cmdlChemDoc.uri);
      expect(doc).toBeInstanceOf(TextDocument);
    });
    it("registes a CMDL notebook", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlNotebook1);
      const notebook = compiler.getDocument(cmdlNotebook1.uri);
      expect(notebook).toBeInstanceOf(NotebookDocument);
    });
  });

  describe("retrieval methods", () => {
    it("throws an error when getting a non-existant document", () => {
      const compiler = new CmdlCompiler();
      expect(() => compiler.getDocument(cmdlChemDoc.uri)).toThrow();
    });

    it("throws an error when getting a non-existant notebook", () => {
      const compiler = new CmdlCompiler();
      expect(() => compiler.getDocument(cmdlNotebook1.uri)).toThrow();
    });

    it("can get a file activation record", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const fileAR = compiler.getFileAR(cmdlChemDoc.fileName);
      expect(fileAR).toBeTruthy();
      expect(fileAR.fileName).toBe(cmdlChemDoc.fileName);
    });

    it("throws an error if a file activation record does not exist", () => {
      const compiler = new CmdlCompiler();
      expect(() => compiler.getFileAR(cmdlChemDoc.fileName)).toThrow();
    });

    it("can get a symbol table for a file", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const symbolTable = compiler.getSymbolTable(cmdlChemDoc.fileName);
      expect(symbolTable).toBeTruthy();
      expect(symbolTable.scope).toBe(cmdlChemDoc.fileName);
    });

    it("throws an error when attempting to get a non-existant symbol table", () => {
      const compiler = new CmdlCompiler();
      expect(() => compiler.getSymbolTable(cmdlChemDoc.fileName)).toThrow();
    });

    it("can get a uri by filename", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const uri = compiler.getUriByFileName(cmdlChemDoc.fileName);
      expect(uri).toBe(cmdlChemDoc.uri);
    });

    it("throws an error if document does not exist to retrieve uri from", () => {
      const compiler = new CmdlCompiler();
      expect(() => compiler.getUriByFileName(cmdlChemDoc.fileName)).toThrow();
    });
  });

  describe("update and remove methods", () => {
    it("can update a CMDL document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      compiler.updateDocument({ ...cmdlChemDoc, version: 2 });
      const updatedDoc = compiler.getDocument(cmdlChemDoc.uri);
      expect(updatedDoc).toBeInstanceOf(TextDocument);
      expect(updatedDoc.version).toBe(2);
    });

    it("adds a CMDL notebook cell", () => {
      const newCell = cmdlNotebook3.cells[0];
      const compiler = new CmdlCompiler();
      compiler.register(cmdlNotebook1);
      compiler.addNotebookCell(cmdlNotebook1.uri, newCell);
      const notebook = compiler.getDocument(cmdlNotebook1.uri);
      expect(notebook).toBeInstanceOf(NotebookDocument);
      expect((notebook as NotebookDocument).cells.has(newCell.uri));
    });

    it("updates a CMDL notebook cell", () => {
      const updatedCell = { ...cmdlNotebook1.cells[0], version: 2 };
      const compiler = new CmdlCompiler();
      compiler.register(cmdlNotebook1);
      compiler.updateNotebookCell(cmdlNotebook1.uri, updatedCell);
      const notebook = compiler.getDocument(cmdlNotebook1.uri);
      expect(notebook).toBeInstanceOf(NotebookDocument);
      expect(
        (notebook as NotebookDocument).cells.has(updatedCell.uri)
      ).toBeTruthy();
      const cell = (notebook as NotebookDocument).getCell(updatedCell.uri);
      expect(cell.version).toBe(2);
    });

    it("deletes a CMDL notebook cell", () => {
      const deleteCellUri = cmdlNotebook1.cells[0].uri;
      const compiler = new CmdlCompiler();
      compiler.register(cmdlNotebook1);
      compiler.removeNotebookCell(deleteCellUri, cmdlNotebook1.uri);
      const notebook = compiler.getDocument(cmdlNotebook1.uri);
      expect(notebook).toBeInstanceOf(NotebookDocument);
      expect(
        (notebook as NotebookDocument).cells.has(deleteCellUri)
      ).not.toBeTruthy();
    });

    it("unregisters a CMDL document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      compiler.unregister(cmdlChemDoc.uri);
      expect(() => compiler.getDocument(cmdlChemDoc.uri)).toThrow();
    });

    it("unregisters a CMDL notebook document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlNotebook1);
      compiler.unregister(cmdlNotebook1.uri);
      expect(() => compiler.getDocument(cmdlNotebook1.uri)).toThrow();
    });
  });

  describe("completion provider methods", () => {
    it("can retrieve file symbol members", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const symbolMembers = compiler.getFileSymbolMembers(
        cmdlChemDoc.fileName,
        "TMC"
      );
      expect(symbolMembers).toBeTruthy();
      expect(symbolMembers?.length).toBe(0);
    });

    it("can retrieve file declarations", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const fileDeclarations = compiler.getFileDeclarations(
        cmdlChemDoc.fileName
      );
      expect(fileDeclarations).toBeTruthy();
      expect(fileDeclarations.length).toBe(33);
    });

    it("can provide import completions", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const importCompletions = compiler.provideImportCompletions(
        [cmdlChemDoc.fileName],
        "TMC"
      );
      expect(importCompletions).toBeTruthy();
      expect(importCompletions.length).toBe(13);
    });
  });

  describe("execution of CMDL documents", () => {
    it("can execute a CMDL document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const output = compiler.execute(cmdlChemDoc.uri);
      expect(typeof output === "string").not.toBeTruthy();
      expect((output as CellRenderOutput).chemicals.length).toBe(33);
    });

    it("can execute a CMDL notebook document", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      compiler.register(cmdlPolyGraphDoc);
      compiler.register(cmdlNotebook1);
      compiler.execute(cmdlNotebook1.uri, cmdlNotebook1.cells[0].uri);
      const output2 = compiler.execute(
        cmdlNotebook1.uri,
        cmdlNotebook1.cells[1].uri
      );
      expect(typeof output2 === "string").not.toBeTruthy();
      expect((output2 as CellRenderOutput).reactions.length).toBe(1);
    });

    it("can get errors for a file", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      const errs = compiler.getErrors(cmdlChemDoc.uri, cmdlChemDoc.fileName);
      expect(errs).toBeTruthy();
      expect(errs.length).toBe(0);
    });
  });

  describe("exporting records from repository", () => {
    it("can export a file", () => {
      const compiler = new CmdlCompiler();
      compiler.register(cmdlChemDoc);
      compiler.register(cmdlPolyGraphDoc);
      compiler.register(cmdlNotebook1);
      for (const cell of cmdlNotebook1.cells) {
        compiler.execute(cmdlNotebook1.uri, cell.uri);
      }
      const output = compiler.exportFile(cmdlNotebook1.uri);
      expect(output.length).toBe(6);
      expect(output[0].input_results).toEqual(exampleInputResults);
    });

    it("can export a whole repository", () => {
      const compiler = new CmdlCompiler();
      const notebooks = [cmdlNotebook1, cmdlNotebook2, cmdlNotebook3];
      compiler.register(cmdlChemDoc);
      compiler.register(cmdlPolyGraphDoc);

      for (const notebook of notebooks) {
        compiler.register(notebook);
        for (const cell of notebook.cells) {
          compiler.execute(notebook.uri, cell.uri);
        }
      }

      const output = compiler.exportRepository(notebooks.map((el) => el.uri));
      expect(output.length).toBe(16);
      expect(output[0]).toHaveProperty("repository");
      expect(output[0].repository.filename).toBe("notebook1.cmdnb");
    });
  });
});
