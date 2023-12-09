export const cmdlChemicals = `
chemical Potassium_Methoxide {
    molecular_weight: 69.98 g/mol;
    smiles: "C[O-].[K+]";
}

chemical CF3-4-U {
    molecular_weight: 484.04 g/mol;
    smiles: "O=C(NC1=CC(C(F)(F)F)=CC(C(F)(F)F)=C1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: ["1,3-bis(3,5-bis(trifluoromethyl)phenyl)urea"];
}

chemical TMC-Bn {
    molecular_weight: 250.08 g/mol;
    smiles: "O=C(C1(C)COC(OC1)=O)OCC2=CC=CC=C2";
}

chemical THF {
    molecular_weight: 72.06 g/mol;
    smiles: "C1CCCO1";
    density: 0.889 g/ml;
}

chemical TMC-BnCl {
    molecular_weight: 298.06 g/mol;
    smiles: "O=C1OCC(C(OCC2=CC=C(CCl)C=C2)=O)(C)CO1";
    aliases: [ "4-(chloromethyl)benzyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMC {
    molecular_weight: 102.3 g/mol;
    smiles: "O=C1OCCCO1";
    aliases: [ "trimethylene carbonate" ];
}

chemical TMC-Furan {
    molecular_weight: 240.06 g/mol;
    smiles: "O=C1OCC(C(OCC2=CC=CO2)=O)(C)CO1";
    aliases: [ "furan-2-ylmethyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMP-OAllyl {
    molecular_weight: 200.1 g/mol;
    smiles: "O=C1OCC(COCC=C)(CC)CO1";
}

chemical TMC-2-NitroBenzyl {
    molecular_weight: 295.07 g/mol;
    smiles: "O=C1OCC(C(OCC2=CC=CC=C2[N+]([O-])=O)=O)(C)CO1";
    aliases: [ "2-nitrobenzyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMC-tBu {
    molecular_weight: 216.1 g/mol;
    smiles: "O=C1OCC(C(OC(C)(C)C)=O)(C)CO1";
    aliases: [ "tert-butyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMC-tBuAc {
    molecular_weight: 274.11 g/mol;
    smiles: "O=C1OCC(C(OCC(OC(C)(C)C)=O)=O)(C)CO1";
    aliases: [ "2-(tert-butoxy)-2-oxoethyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}


chemical Ph-DOA {
    molecular_weight: 207.09 g/mol;
    smiles: "O=C1OCCN(C2=CC=CC=C2)CCO1";
    aliases: [ "6-phenyl-1,3,6-dioxazocan-2-one" ];
}

chemical DM-TMC {
    molecular_weight: 130.06 g/mol;
    smiles: "O=C1OCC(C)(C)CO1";
    aliases: [ "5,5-dimethyl-1,3-dioxan-2-one" ];
}

chemical DE-TMC {
    molecular_weight: 158.09 g/mol;
    smiles: "O=C1OCC(CC)(CC)CO1";
    aliases: [ "5,5-diethyl-1,3-dioxan-2-one" ];
}

chemical MP-TMC {
    molecular_weight: 158.09 g/mol;
    smiles: "O=C1OCC(CCC)(C)CO1";
    aliases: [ "5-methyl-5-propyl-1,3-dioxan-2-one" ];
}

chemical Ph-1-CF3-U {
    molecular_weight: 280.08 g/mol;
    smiles: "O=C(NC1=CC=CC=C1)NC2=CC(C(F)(F)F)=CC=C2";
    aliases: [ "1-phenyl-3-(3-(trifluoromethyl)phenyl)urea" ];
}

chemical Ph-Ph-U {
    molecular_weight: 212.09 g/mol;
    smiles: "O=C(NC1=CC=CC=C1)NC2=CC=CC=C2";
    aliases: [ "1,3-Ph-Ph-U" ];
}

chemical Cy-Ph-U {
    molecular_weight: 218.14 g/mol;
    smiles: "O=C(NC1CCCCC1)NC2=CC=CC=C2";
    aliases: [ "Cy-Ph-U" ];
}

chemical Cy-2-CF3-TU {
    molecular_weight: 370.09 g/mol;
    smiles: "S=C(NC1CCCCC1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: [ "1-(3,5-bis(trifluoromethyl)phenyl)-3-cyclohexylthiourea" ];
}

chemical CF3-3-U {
    molecular_weight: 416.06 g/mol;
    smiles: "O=C(NC1=CC(C(F)(F)F)=CC=C1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: [ "1-(3,5-bis(trifluoromethyl)phenyl)-3-(3-(trifluoromethyl)phenyl)urea" ];
}

chemical CF3-3-TU {
    molecular_weight: 432.03 g/mol;
    smiles: "S=C(NC1=CC(C(F)(F)F)=CC=C1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: [ "1-(3,5-bis(trifluoromethyl)phenyl)-3-(3-(trifluoromethyl)phenyl)thiourea" ];
}

chemical Cy-2-CF3-U {
    molecular_weight: 354.12 g/mol;
    smiles: "O=C(NC1CCCCC1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: [ "1-(3,5-bis(trifluoromethyl)phenyl)-3-cyclohexylurea" ];
}

chemical Ph-2-CF3-U {
    molecular_weight: 348.07 g/mol;
    smiles: "O=C(NC1=CC=CC=C1)NC2=CC(C(F)(F)F)=CC(C(F)(F)F)=C2";
    aliases: [ "1-(3,5-bis(trifluoromethyl)phenyl)-3-phenylurea" ];
}

chemical Ph-1-CF3-TU {
    molecular_weight: 296.06 g/mol;
    smiles: "S=C(NC1=CC=CC=C1)NC2=CC(C(F)(F)F)=CC=C2";
    aliases: [ "1-phenyl-3-(3-(trifluoromethyl)phenyl)thiourea" ];
}

chemical Cy-Ph-TU {
    molecular_weight: 234.12 g/mol;
    smiles: "S=C(NC1CCCCC1)NC2=CC=CC=C2";
    aliases: [ "cyclohexyl-3-phenylthiourea" ];
}

chemical Ph-Ph-TU {
    molecular_weight: 228.07 g/mol;
    smiles: "S=C(NC1CCCCC1)NC2=CC=CC=C2";
    aliases: [ "1,3-Ph-Ph-TU" ];
}

chemical TMC-m-Bpin {
    molecular_weight: 376.17 g/mol;
    smiles: "O=C1OCC(C(OCC2=CC(B3OC(C)(C)C(C)(C)O3)=CC=C2)=O)(C)CO1";
    aliases: [ "3-(4,4,5,5-tetramethyl-1,3,2-dioxaborolan-2-yl)benzyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMC-p-Bpin {
    molecular_weight: 376.17 g/mol;
    smiles: "O=C1OCC(C(OCC2=CC=C(B3OC(C)(C)C(C)(C)O3)C=C2)=O)(C)CO1";
    aliases: [ "4-(4,4,5,5-tetramethyl-1,3,2-dioxaborolan-2-yl)benzyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical TMC-Et-NMePh {
    molecular_weight: 293.13 g/mol;
    smiles: "O=C1OCC(C(OCCN(C)C2=CC=CC=C2)=O)(C)CO1";
    aliases: [ "2-(methyl(phenyl)amino)ethyl 5-methyl-2-oxo-1,3-dioxane-5-carboxylate" ];
}

chemical Bn-DOA {
    molecular_weight: 221.11 g/mol;
    smiles: "O=C1OCCN(CC2=CC=CC=C2)CCO1";
    aliases: [ "6-benzyl-1,3,6-dioxazocan-2-one" ];
}

chemical BnOH {
    molecular_weight: 108.06 g/mol;
    density: 1.04 g/ml;
    smiles: "OCC1=CC=CC=C1";
    aliases: [ "benzyl alcohol" ];
}

chemical DBU {
    molecular_weight: 152.13 g/mol;
    density: 1.02 g/ml;
    smiles: "OCC1=CC=CC=C1";
}

chemical DCM {
    molecular_weight: 83.95 g/mol;
    density: 1.33 g/ml;
    smiles: "ClCCl";
    aliases: [ "dichloromethane" ];
}`;

export const polymerGraphs = `
fragments {
	MeO =: "CO[R:1]";
	BnOH =: "[R:1]OCC1=CC=CC=C1";
	TMCBn =: "CC(CO[Q:2])(C(OCC1=CC=CC=C1)=O)COC([R:1])=O";
	TMCBnCl =: "CC(CO[Q:2])(C(OCC1=CC=C(CCl)C=C1)=O)COC([R:1])=O";
	TMC =: "O=C([R:1])OCCCO[Q:2]";
	TMCFurfuryl =: "O=C(C(CO[Q:2])(C)COC([R:1])=O)OCC1=CC=CO1";
	TMPOAllyl =: "C=CCOCC(CO[Q:2])(CC)COC([R:1])=O";
	TMCNitroBn =: "[O-][N+](C1=CC=CC=C1COC(C(C)(CO[Q:2])COC([R:1])=O)=O)=O";
	TMCtBu =: "CC(CO[Q:2])(C(OC(C)(C)C)=O)COC([R:1])=O";
	TMCtBAc =: "CC(CO[Q:2])(C(OCC(OC(C)(C)C)=O)=O)COC([R:1])=O";
	PhDOA =: "O=C([R:1])OCCN(C1=CC=CC=C1)CCO[Q:2]";
	DMTMC =: "O=C([R:1])OCC(C)(C)CO[Q:2]";
	DETMC =: "O=C([R:1])OCC(CC)(CC)CO[Q:2]";
	MPTMC =: "CC(CO[Q:2])(CCC)COC([R:1])=O";
	BnDOA =: "O=C([R:1])OCCN(CC1=CC=CC=C1)CCO[Q:2]";
	TMCBnpBpin =: "O=C(C(CO[Q:2])(C)COC([R:1])=O)OCC1=CC=C(B2OC(C)(C)C(C)(C)O2)C=C1";
	TMCBnmBpin =: "O=C(C(CO[Q:2])(C)COC([R:1])=O)OCC1=CC=CC(B2OC(C)(C)C(C)(C)O2)=C1";
	TMCMPA =: "CC(CO[Q:2])(C(OCCN(C)C1=CC=CC=C1)=O)COC([R:1])=O";
}


polymer_graph BnO-PhDOA {
	nodes: [ @BnOH ];
	<@BnOH.R => @Carbonate_Block.PhDOA.R>;

	container Carbonate_Block {
		nodes: [ @PhDOA ];
		<@PhDOA.Q => @PhDOA.R>;

	};
}

polymer_graph MeO-PhDOA {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.PhDOA.R>;

	container Carbonate_Block {
		nodes: [ @PhDOA ];
		<@PhDOA.Q => @PhDOA.R>;

	};
}

polymer_graph BnO-BnDOA {
	nodes: [ @BnOH ];
	<@BnOH.R => @Carbonate_Block.BnDOA.R>;

	container Carbonate_Block {
		nodes: [ @BnDOA ];
		<@BnDOA.Q => @BnDOA.R>;

	};
}

polymer_graph MeO-TMPOAllyl {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMPOAllyl.R>;

	container Carbonate_Block {
		nodes: [ @TMPOAllyl ];
		<@TMPOAllyl.Q => @TMPOAllyl.R>;

	};
}

polymer_graph MeO-BnDOA {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.BnDOA.R>;

	container Carbonate_Block {
		nodes: [ @BnDOA ];
		<@BnDOA.Q => @BnDOA.R>;
	};
}

polymer_graph MeO-DETMC {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.DETMC.R>;

	container Carbonate_Block {
		nodes: [ @DETMC ];
		<@DETMC.Q => @DETMC.R>;
	};
}

polymer_graph MeO-DMTMC {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.DMTMC.R>;

	container Carbonate_Block {
		nodes: [ @DMTMC ];
		<@DMTMC.Q => @DMTMC.R>;
	};
}

polymer_graph MeO-MPTMC {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.MPTMC.R>;

	container Carbonate_Block {
		nodes: [ @MPTMC ];
		<@MPTMC.Q => @MPTMC.R>;
	};
}

polymer_graph MeO-TMCBn {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCBn.R>;

	container Carbonate_Block {
		nodes: [ @TMCBn ];
		<@TMCBn.Q => @TMCBn.R>;
	};
}

polymer_graph MeO-TMCBnCl {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCBnCl.R>;

	container Carbonate_Block {
		nodes: [ @TMCBnCl ];
		<@TMCBnCl.Q => @TMCBnCl.R>;
	};
}

polymer_graph MeO-TMCFuran {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCFurfuryl.R>;

	container Carbonate_Block {
		nodes: [ @TMCFurfuryl ];
		<@TMCFurfuryl.Q => @TMCFurfuryl.R>;
	};
}

polymer_graph MeO-TMCMPA {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCMPA.R>;

	container Carbonate_Block {
		nodes: [ @TMCMPA ];
		<@TMCMPA.Q => @TMCMPA.R>;
	};
}

polymer_graph MeO-TMCNitroBn {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCNitroBn.R>;

	container Carbonate_Block {
		nodes: [ @TMCNitroBn ];
		<@TMCNitroBn.Q => @TMCNitroBn.R>;
	};
}

polymer_graph MeO-TMCBnpBpin {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCBnpBpin.R>;

	container Carbonate_Block {
		nodes: [ @TMCBnpBpin ];
		<@TMCBnpBpin.Q => @TMCBnpBpin.R>;
	};
}

polymer_graph MeO-TMCBnmBpin {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCBnmBpin.R>;

	container Carbonate_Block {
		nodes: [ @TMCBnmBpin ];
		<@TMCBnmBpin.Q => @TMCBnmBpin.R>;
	};
}

polymer_graph MeO-TMCtBAc {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCtBAc.R>;

	container Carbonate_Block {
		nodes: [ @TMCtBAc ];
		<@TMCtBAc.Q => @TMCtBAc.R>;
	};
}

polymer_graph MeO-TMCtBu {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMCtBu.R>;

	container Carbonate_Block {
		nodes: [ @TMCtBu ];
		<@TMCtBu.Q => @TMCtBu.R>;
	};
}

polymer_graph MeO-TMC {
	nodes: [ @MeO ];
	<@MeO.R => @Carbonate_Block.TMC.R>;

	container Carbonate_Block {
		nodes: [ @TMC ];
		<@TMC.Q => @TMC.R>;
	};
}`;

export const notebook1 = {
  metadata: { notebookId: "7f4db489-d2d2-470e-8e90-539abd1536cc" },
  cells: [
    {
      kind: 2,
      language: "cmdl",
      value:
        '\nimport BnOH from "./lib/chemicals.cmdl";\nimport CF3-4-U from "./lib/chemicals.cmdl";\nimport DBU from "./lib/chemicals.cmdl";\nimport Bn-DOA from "./lib/chemicals.cmdl";\nimport THF from "./lib/chemicals.cmdl";\nimport BnO-BnDOA from "./lib/polymer_graphs.cmdl";\nimport Ph-1-CF3-U from "./lib/chemicals.cmdl";\n\nmetadata {\n\ttitle: "Synthesis of polycarbonate BnOH-p(Bn-DOA)100";\n\ttags: ["ring-opening polymerization"];\n\tdate: "6/1/2018";\n\texp_id: "CC1865";\n}\n\n\npolymer PC-BnOH-pBn-DOA100 {\n\tstructure: @BnO-BnDOA;\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1865-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 20 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.025 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1865-A-gpc {\n\ttime_point: 20 s;\n\tsample_id: "CC1865-A";\n\ttechnique: "gpc";\n\tsource: @CC1865-rxn;\n\n\t@PC-BnOH-pBn-DOA100 {\n\t\tmn_avg: 569 g/mol;\n\t\tdispersity: 1.02;\n\t};\n}\n\nchar_data CC1865-A-nmr {\n\ttime_point: 20 s;\n\tsample_id: "CC1865-A";\n\ttechnique: "nmr";\n\tsource: @CC1865-rxn;\n\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA {\n\t\tdegree_poly: 5;\n\t};\n\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1866-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 40 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.025 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1866-A-gpc {\n\ttime_point: 40 s;\n\ttechnique: "gpc";\n\tsample_id: "CC1866-A";\n\tsource: @CC1866-rxn;\n\n\t@PC-BnOH-pBn-DOA100 {\n\t\tmn_avg: 579 g/mol;\n\t\tdispersity: 1.02;\n\t};\n}\n\nchar_data CC1866-A-nmr {\n\ttime_point: 40 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1866-A";\n\tsource: @CC1866-rxn;\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA{\n\t\tdegree_poly: 5;\n\t};\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1867-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 60 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.025 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1867-A-gpc {\n\ttime_point: 60 s;\n\ttechnique: "gpc";\n\tsample_id: "CC1867-A";\n\tsource: @CC1867-rxn;\n\n\t@PC-BnOH-pBn-DOA100 {\n\t\tmn_avg: 615 g/mol;\n\t\tdispersity: 1.03;\n\t};\n}\n\nchar_data CC1867-A-nmr {\n\ttime_point: 60 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1867-A";\n\tsource: @CC1867-rxn;\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA {\n\t\tdegree_poly: 5;\n\t};\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1869-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 20 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Ph-1-CF3-U {\n\t\tmass: 1.75 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1869-A-nmr {\n\ttime_point: 20 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1869-A";\n\tsource: @CC1869-rxn;\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA {\n\t\tdegree_poly: 5;\n\t};\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n\t\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1870-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 40 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Ph-1-CF3-U {\n\t\tmass: 1.75 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1870-A-nmr {\n\ttime_point: 40 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1870-A";\n\tsource: @CC1870-rxn;\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA {\n\t\tdegree_poly: 5;\n\t};\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1871-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 60 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@Bn-DOA {\n\t\tmass: 55.28 mg;\n\t\troles: ["monomer"];\n\t};\n\t@DBU {\n\t\tmass: 0.9508 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Ph-1-CF3-U {\n\t\tmass: 1.75 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@BnOH {\n\t\tmass: 0.2702 mg;\n\t\troles: ["initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-BnOH-pBn-DOA100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1871-A-nmr {\n\ttime_point: 60 s;\n\tsample_id: "CC1871-A";\n\ttechnique: "nmr";\n\tsource: @CC1871-rxn;\n\n\t@PC-BnOH-pBn-DOA100.BnO-BnDOA.Carbonate_Block.BnDOA {\n\t\tdegree_poly: 5;\n\t};\n\n\t@Bn-DOA {\n\t\tconversion: 5 %;\n\t};\n}',
      outputs: [],
    },
  ],
};
export const notebook2 = {
  metadata: { notebookId: "2867235f-6612-4685-923a-acf0080f23fe" },
  cells: [
    {
      kind: 2,
      language: "cmdl",
      value:
        '\nimport Potassium_Methoxide from "./lib/chemicals.cmdl";\nimport CF3-4-U from "./lib/chemicals.cmdl";\nimport Ph-Ph-U from "./lib/chemicals.cmdl";\nimport Ph-1-CF3-TU from "./lib/chemicals.cmdl";\nimport TMP-OAllyl from "./lib/chemicals.cmdl";\nimport THF from "./lib/chemicals.cmdl";\nimport DCM from "./lib/chemicals.cmdl";\nimport MeO-TMPOAllyl from "./lib/polymer_graphs.cmdl";\n\nmetadata {\n\ttitle: "PC-KOMe-p(AOME-TMC)100";\n\ttags: ["ring-opening polymerization"];\n\tdate: "4/1/2018";\n\texp_id: "CC1810";\n}\n\n\npolymer PC-KOMe-pAOME-TMC100 {\n\tstructure: @MeO-TMPOAllyl;\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1810-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 10 s;\n\tdate: "4/1/2018";\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.63 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1810-nmr {\n\ttechnique: "nmr";\n\tsample_id: "CC1810-A";\n\ttime_point: 10 s;\n\tsource: @CC1810-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 0;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1829-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 10 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.63 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1829-A-nmr {\n\ttime_point: 10 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1829-A";\n\tsource: @CC1829-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 0;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        '\nreaction CC1852-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 15 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@Ph-Ph-U {\n\t\tmass: 1.591 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1852poly-aome-tmc-t15-88056-gpc {\n\ttechnique: "gpc";\n\tsample_id: "CC1852-A";\n\ttime_point: 15 s;\n\tsource: @CC1852-rxn;\n\n\t@PC-KOMe-pAOME-TMC100 {\n\t\tmn_avg: 2783 g/mol;\n\t\tdispersity: 2.06;\n\t};\n}\n\nchar_data CC1852poly-aome-t15-nmr {\n\ttechnique: "nmr";\n\tsample_id: "CC1852-A";\n\ttime_point: 15 s;\n\tsource: @CC1852-rxn;\n\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 5;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 5 %;\n\t};\n}\n\nchar_data CC1852polyaome-tmc-precip89209-gpc {\n\ttechnique: "gpc";\n\tsample_id: "CC1852-B";\n\ttime_point: 15 s;\n\tsource: @CC1852-rxn;\n\n\t@PC-KOMe-pAOME-TMC100 {\n\t\tmn_avg: 2783 g/mol;\n\t\tdispersity: 2.06;\n\t};\n}\n\nchar_data CC1852polyaome-tmc-nmr {\n\ttechnique: "nmr";\n\tsample_id: "CC1852-B";\n\ttime_point: 15 s;\n\tsource: @CC1852-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 5;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1862-rxn {\n\ttemperature: -20 degC;\n\treaction_time: 300 s;\n\tdate: "6/4/2018";\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.63 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1862-A-nmr {\n\ttime_point: 300 s;\n\ttechnique: "nmr";\n\tdate: "6/4/2018";\n\tsample_id: "CC1862-A";\n\tsource: @CC1862-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 0;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1863-rxn {\n\ttemperature: -20 degC;\n\treaction_time: 30 s;\n    date: "6/4/2018";\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.63 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1863-A-nmr {\n\ttime_point: 30 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1863-A";\n\tsource: @CC1863-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 0;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1895-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 30 s;\n\tdate: "7/1/2018";\n\n\t@DCM {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@TMP-OAllyl {\n\t\tmass: 50.02 mg;\n\t\troles: ["monomer"];\n\t};\n\t@Ph-1-CF3-TU {\n\t\tmass: 2.22 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@PC-KOMe-pAOME-TMC100 {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1895-A-nmr {\n\ttime_point: 30 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1895-A";\n\tsource: @CC1895-rxn;\n\n\t@PC-KOMe-pAOME-TMC100.MeO-TMPOAllyl.Carbonate_Block.TMPOAllyl {\n\t\tdegree_poly: 0;\n\t};\n\n\t@TMP-OAllyl {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
  ],
};
export const notebook3 = {
  metadata: { notebookId: "15dbeb4d-5ef4-4547-8f1c-cefc961b9dbf" },
  cells: [
    {
      kind: 2,
      language: "cmdl",
      value:
        '\nimport Potassium_Methoxide from "./lib/chemicals.cmdl";\nimport CF3-4-U from "./lib/chemicals.cmdl";\nimport Ph-1-CF3-U from "./lib/chemicals.cmdl";\nimport Cy-2-CF3-TU from "./lib/chemicals.cmdl";\nimport DE-TMC from "./lib/chemicals.cmdl";\nimport THF from "./lib/chemicals.cmdl";\nimport DCM from "./lib/chemicals.cmdl";\nimport MeO-DETMC from "./lib/polymer_graphs.cmdl";\n\nmetadata {\n\ttitle: "PC-KOMe-p(DE-TMC)25";\n\ttags: ["ring-opening polymerization"];\n\tdate: "5/3/2018";\n\texp_id: "CC1839";\n}\n\n\npolymer MeO-pDE-TMC {\n\tstructure: @MeO-DETMC;\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1839-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 20 s;\n\tdate: "5/3/2018";\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@DE-TMC {\n\t\tmass: 39.52 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 14.52 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.6998 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@MeO-pDE-TMC {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1839-A-nmr {\n\ttime_point: 20 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1839";\n\tsource: @CC1839-rxn;\n\n\t@MeO-pDE-TMC.MeO-DETMC.Carbonate_Block.DETMC {\n\t\tdegree_poly: 1.5;\n\t};\n\n\t@DE-TMC {\n\t\tconversion: 6 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1834-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 10 s;\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@DE-TMC {\n\t\tmass: 39.52 mg;\n\t\troles: ["monomer"];\n\t};\n\t@CF3-4-U {\n\t\tmass: 3.63 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@MeO-pDE-TMC {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1834-A-nmr {\n\ttime_point: 10 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1834-A";\n\tsource: @CC1834-rxn;\n\n\t@MeO-pDE-TMC.MeO-DETMC.Carbonate_Block.DETMC {\n\t\tdegree_poly: 0;\n\t};\n\n\t@DE-TMC {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1845-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 60 s;\n\tdate: "6/1/2018";\n\n\t@THF {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@DE-TMC {\n\t\tmass: 39.52 mg;\n\t\troles: ["monomer"];\n\t};\n\t@Ph-1-CF3-U {\n\t\tmass: 2.101 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@MeO-pDE-TMC {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1845-A-gpc {\n\ttime_point: 60 s;\n\ttechnique: "gpc";\n\tsample_id: "CC1845-A";\n\tsource: @CC1845-rxn;\n\n\t@MeO-pDE-TMC {\n\t\tmn_avg: 1574 g/mol;\n\t\tdispersity: 1.14;\n\t};\n}\nchar_data CC1845-A-nmr {\n\ttime_point: 60 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1845-A";\n\tsource: @CC1845-rxn;\n\n\t@MeO-pDE-TMC.MeO-DETMC.Carbonate_Block.DETMC {\n\t\tdegree_poly: 16;\n\t};\n\t@DE-TMC {\n\t\tconversion: 16 %;\n\t};\n}',
      outputs: [],
    },
    {
      kind: 2,
      language: "cmdl",
      value:
        'reaction CC1878-rxn {\n\ttemperature: 20 degC;\n\treaction_time: 300 s;\n\n\t@DCM {\n\t\tvolume: 0.25 ml;\n\t\troles: ["solvent"];\n\t};\n\t@DE-TMC {\n\t\tmass: 39.52 mg;\n\t\troles: ["monomer"];\n\t};\n\t@Cy-2-CF3-TU {\n\t\tmass: 2.776 mg;\n\t\troles: ["catalyst"];\n\t};\n\t@Potassium_Methoxide {\n\t\tmass: 0.175 mg;\n\t\troles: ["catalyst", "initiator"];\n\t\tlimiting: true;\n\t};\n\t@MeO-pDE-TMC {\n\t\troles: ["product"];\n\t};\n}\n\nchar_data CC1878-A-nmr {\n\ttime_point: 300 s;\n\ttechnique: "nmr";\n\tsample_id: "CC1878-A";\n\tsource: @CC1878-rxn;\n\n\t@MeO-pDE-TMC.MeO-DETMC.Carbonate_Block.DETMC {\n\t\tdegree_poly: 0;\n\t};\n\n\t@DE-TMC {\n\t\tconversion: 0 %;\n\t};\n}',
      outputs: [],
    },
  ],
};
