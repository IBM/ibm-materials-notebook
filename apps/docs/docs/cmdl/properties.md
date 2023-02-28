# CMDL Properties

[[toc]]

## Text Properties

### BigSMILES

---

- **_Description_**: Line notation for polymers.
- **_Example_**:

```cmdl{2}
polymer PEO-PPO {
    big_smiles: "{[][<]OCC[>][<]}{[>][<]OC(C)C[>][]}";
}
```

### Citation

---

- **_Description_**: Citation for journal article source of an experiment
- **_Example_**:

```cmdl
source {
    citation: "Example Journal, 12, 1, 123-125.";
}
```

### Date

---

- **_Description_**: Describes date of occurance of sample or experiment
- **_Example_**:

**Note**: Currently only supports mm/dd/yy date format.

```cmdl{2}
metadata {
    date: "1/23/22";
}
```

### Description

---

- **_Description_**: Additional description text for a component or other element.
- **_Example_**:

```cmdl
component Monomer_Syringe {
    description: "NormJect 25 ml syringe"
}
```

### DOI

---

- **_Description_**: DOI for a journal article source
- **_Example_**:

```cmdl
source {
    doi: "10.1021/acs.macromol.0c01571";
}
```

### Experiment Id

---

- **_Description_**: Identifier given to an experimental record by user, such as a notebook number
- **_Example_**:

```cmdl
metadata {
    exp_id: "EXP-I-123";
}
```

### Inchi Key

---

- **_Description_**: InChi key for a small-molecule chemical
- **_Example_**:

```cmdl
chemical TEA {
    inchi_key: "ZMANZCXQSJIPKH-UHFFFAOYSA-N";
}
```

### Owner

---

- **_Description_**: Owner or generator of experimental record.
- **_Example_**:

```cmdl
metadata {
    owner: "Test Owner";
}
```

### Physical State

---

- **_Description_**: Physical state of a chemical or material in terms of solid, liquid, or gas under standard conditions. Used for computing stochiometry.
- **_Example_**:

```cmdl
chemical Solid_Chemical {
    state: "solid";
}
```

### NMR Nuclei

---

- **_Description_**: Nucleus for a NMR spectra (e.g. <sup>1</sup>H, <sup>13</sup>C, <sup>19</sup>F).
- **_Example_**:

```cmdl
sample Test_Sample_A {
    nmr Test_NMR {
        nmr_nucleas: "1H";
    };
}
```

### Limiting

---

- **_Description_**: Boolean value indicting that the chemical or polymer is a limiting reagent.
- **_Example_**:

```cmdl{5}
reaction Example_RXN {
    @Reagent1 {
        mass: 100 mg;
        roles: [ "reagent" ];
        limiting: true;
    };
}
```

### Ratio

---

- **_Description_**: Ratio of components in a macromolecular complex
- **_Example_**: _under development_

### Reaction Roles

---

- **_Description_**: Role of a particular chemical or polymer within a chemical reaction.
- **_Example_**:

```cmdl{4}
reaction Example_RXN {
    @Reagent1 {
        mass: 100 mg;
        roles: [ "reagent" ];
        limiting: true;
    };
}
```

### Reactor

---

- **_Description_**: References which reactor is used for a particular flow reaction.
- **_Example_**:

```cmdl
flow_reaction Example_RXN {
    reactor: @Example_Reactor;
}
```

### Record Id

---

- **_Description_**: Experimental id assigned by a database system, such as the MongoDB ObjectId.
- **_Example_**:

```cmdl
metadata {
    record_id: "620f207950c16f9dax5z3485";
}
```

### SMILES

---

- **_Description_**: SMILES line notation for small-molecules
- **_Example_**:

```cmdl
chemical THF {
    smiles: "C1CCOC1";
}
```

### Source Type

---

- **_Description_**: Type of source referenced in source group
- **_Example_**:

```cmdl
source {
    source_type: "notebook";
}
```

### Tags

---

- **_Description_**: Tags for an experiment or other record. Used in the metadata group.
- **_Example_**:

```cmdl
metadata {
    tags: [ "polymerization", "ring-opening_polymerization" ];
}
```

### Target

---

- **_Description_**: Node to which the current node is connected to within a reactor graph.
- **_Example_**:

**Note**: The example is only a fragment of a full `reactor_graph` definition. See the [continuous flow tutorial](../guide/flow_exp_tutorial.md) for a full example.

```cmdl
reactor_graph Test_Reactor {
    component Monomer_Syringe {
        target: @Monomer_Pump
    };

    component Monomer_Pump {
        target: @Reactor_T_Mixer;
    }
}
```

### Template Type

---

- **_Description_**: Type of template for the current record in the notebook document. Instructs CMDL on how to export the record upon saving.
- **_Example_**:

```cmdl
metadata {
    template: "batch_experiment";
}
```

### Title

---

- **_Description_**: Title of an experiment or record.
- **_Example_**:

```cmdl
metadata {
    title: "Important example experiment title";
}
```

### Tree

---

- **_Description_**: Reference property which assigns a reactor graph/composite tree representation to a polymer reference.
- **_Example_**:

```cmdl{2}
polymer mPEG-OH {
   tree: @PEG_BASE;
   mn_avg: 5000 g/mol;

   @PEG_BASE.PEG_Block.p_PEO {
      degree_poly: 112.8
   };
}
```

## Physical Properties

### Boiling Point

---

- **_Description_**: Boiling point of a chemical compound
- **_Units_**:
  - degC
  - degK
- **_Example_**: _in progress_

### Cell Viability

---

- **_Description_**: Viability of a cell following treatment with a therapeutic compound at a given conenctration
- **_Units_**:
  - Percent (%)
- **_Example_**: _in progress_

### Collection Time

---

- **_Description_**: Time after start of the continous flow run at which the sample was collected.
- **_Units_**:
- **_Example_**: _in progress_

### Conversion

---

- **_Description_**: Percent conversion of a given chemical species in a reaction.
- **_Units_**:
  - Percent (%)
- **_Example_**:

```cmdl
sample Test-I-123A {
   time_point: 5 s;

   nmr Test-I-123A-nmr {
      nmr_nuclei: "1H";

      @lLactide {
         conversion: 75%;
      };
   };
}
```

### Crystallization Temperature

---

- **_Description_**: Temperature of crystallization of a chemical compound.
- **_Units_**:
  - degC
  - degK
- **_Example_**: _in progress_

### Degree of Polymerization

---

- **_Description_**: Degree of polymerization of a polymeric material or component of a polymeric material.
- **_Units_**: None
- **_Example_**:

```cmdl
sample Test-I-123A {
   time_point: 5 s;

   nmr Test-I-123A-nmr {
      nmr_nuclei: "1H";

       @mPEG-PLLA.Lactide_Block.p_lLac {
         degree_poly: 78;
      };
   };
}
```

### Density

---

- **_Description_**: Density of a chemical compound. Required for chemical references whose physical state is a liquid and where volumetric quantity is used in a reaction or solution.
- **_Units_**:
  - g/ml
- **_Example_**:

```cmdl{2}
chemical THF {
    molecular_weight: 72.1 g/mol;
    density: 0.88 g/ml;
    state: "liquid";
    smiles: "C1CCOC1";
}
```

### Dispersity

---

- **_Description_**: Molecular weight dispersity of a polymeric material.
- **_Units_**: None
- **_Example_**:

```cmdl{11-13}
sample Test-I-123A {
   time_point: 5 s;

   gpc Test-I-123A-gpc {
      @mPEG-PLLA {
         dispersity: 1.34;
         mn_avg: 12000 g/mol;
      };
   };
}
```

### Flow Rate

---

- **_Description_**: Rate of flow for a given input for a flow reaction.
- **_Units_**:
  - ml/min
- **_Example_**:

```cmdl
flow_reaction FlowTest {
    reactor: @ReactorTest;
    temperature: 22 degC;

    @Monomer_Solution {
        flow_rate: 10 ml/min;
    };

    @Catalyst_Solution {
        flow_rate: 10 ml/min;
    };

    @Quench_Solution {
        flow_rate: 10 ml/min;
    };
}
```

### Glass Transition Temperature

---

- **_Description_**: Glass transition temperature of a polymeric material.
- **_Units_**:
  - degC
  - degK
- **_Example_**:

### HC<sub>50</sub>

---

- **_Description_**: HC<sub>50</sub> value of a chemical compound or material.
- **_Units_**:
  - mg/l
  - µg/ml
- **_Example_**: _in progress_

### Hydrodynamic Diameter

---

- **_Description_**: Hydrodynamic diameter (Dh) of a material.
- **_Units_**:
  - nm
- **_Example_**: _in progress_

### Hydrodynamic Diameter Dispersity

---

- **_Description_**: Dispersity of the hydrodynamic diameter of a material.
- **_Units_**: None
- **_Example_**: _in progress_

### Lambda Max Absorbtion

---

- **_Description_**: Absorbtion maximum of a compound or material.
- **_Units_**:
  - nm
- **_Example_**: _in progress_

### Lamda Max Emission

---

- **_Description_**: Emission maximum of a compound or material.
- **_Units_**:
- **_Example_**:

### Length

---

- **_Description_**: Length of a reactor component or other element.
- **_Units_**:
- **_Example_**:

```cmdl{10}
reactor QuenchReactor {
    component Quench_Mixer {
        description: "PEEK T-Mixer (0.1 cm ID) ";
        inner_diameter: 0.1 cm;
        target: @Quench_Reactor;
    };
    component Quench_Reactor {
        description: "PFA Reactor Tubing (2 cm, 0.1 cm ID)";
        inner_diameter: 0.1 cm;
        length: 2 cm;
        volume: 0.0157 ml;
        target: @Collection;
    };
}
```

### Loading Capacity

---

- **_Description_**: Loading capacity of a micelle or other superamolecular complex for a small-molecule cargo
- **_Units_**:
  - wt %;
- **_Example_**: _in progress_

### Molecular Weight

---

- **_Description_**: Molecular weight of a chemical compound
- **_Units_**:
  - g/mol
- **_Example_**:

```cmdl{2}
chemical THF {
    molecular_weight: 72.1 g/mol;
    density: 0.88 g/ml;
    state: "liquid";
    smiles: "C1CCOC1";
}
```

### Outer Diameter

---

- **_Description_**: Outer diameter of a piece of tubing.
- **_Units_**:
  - mm
- **_Example_**: _in progress_

### Inner Diameter

---

- **_Description_**: Inner diameter of a piece of tubing
- **_Units_**:
  - mm
- **_Example_**:

```cmdl{4}
reactor QuenchReactor {
    component Quench_Mixer {
        description: "PEEK T-Mixer (0.1 cm ID) ";
        inner_diameter: 0.1 cm;
        target: @Quench_Reactor;
    };
}
```

### M<sub>n</sub>

---

- **_Description_**: Number average molecular weight.
- **_Units_**:
  - g/mol
  - Da
  - kDa
- **_Example_**:

```cmdl{6}
sample Test-I-123A {
   time_point: 5 s;

   gpc Test-I-123A-gpc {
      @mPEG-PLLA {
         dispersity: 1.34;
         mn_avg: 12000 g/mol;
      };
   };
}
```

### M<sub>w</sub>

---

- **_Description_**: Weighte average molecular weight.
- **_Units_**:
  - g/mol
  - Da
  - kDa
- **_Example_**:

```cmdl{7}
sample Test-I-123A {
   time_point: 5 s;

   gpc Test-I-123A-gpc {
      @mPEG-PLLA {
         dispersity: 1.34;
         mn_avg: 12000 g/mol;
         mw_avg: 16080 g/mol;
      };
   };
}
```

### Mass

---

- **_Description_**: Mass of a chemical compound.
- **_Units_**:
- **_Example_**:

```cmdl{6}
reaction BatchRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @kOtBu {
      mass: 5 mg;
      roles: [ "catalyst", "reagent" ];
   };
}
```

### Melting Temperature

---

- **_Description_**: Melting temperature of a chemical compound.
- **_Units_**:
  - degc
  - degK
- **_Example_**: _in progress_

### Minimum Inhibitory Concentration

---

- **_Description_**: Minimum inhibitory concentration of a chemical compound or material.
- **_Units_**:
  - mg/l
  - µg/ml
- **_Example_**: _in progress_

### Moles

---

- **_Description_**: Moles of a chemical compound.
- **_Units_**:
- **_Example_**:

```cmdl{6}
reaction BatchRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @kOtBu {
      moles: 0.3 mmol;
      roles: [ "catalyst", "reagent" ];
   };
}
```

### Onset Temperature

---

- **_Description_**: Onset temperature for degredation of a material.
- **_Units_**:
- **_Example_**: _in progress_

### Pressure

---

- **_Description_**: Pressure of a chemical compound.
- **_Units_**:
- **_Example_**: _in progress_

### Pressure Rate

---

- **_Description_**: Rate of pressure change in a process.
- **_Units_**:
- **_Example_**: _in progress_

### Quantity

---

- **_Description_**: Quantity of a particular item or entity.
- **_Units_**: None
- **_Example_**:

```cmdl{5,9}
fragment p_Llac {
   molecular_weight: 144.04 g/mol;
   smiles: "O=C(O[C@H](C([R])=O)C)[C@@H](O[Q])C";

   point R {
      quantity: 1;
   };

   point Q {
      quantity: 1;
   };
}
```

### Reaction Time

---

- **_Description_**: Total time of a chemical reaction.
- **_Units_**:
- **_Example_**:

### Run Time

---

- **_Description_**:
- **_Units_**:
- **_Example_**:

```cmdl{3}
reaction BatchRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @kOtBu {
      moles: 0.3 mmol;
      roles: [ "catalyst", "reagent" ];
   };
}
```

### Sublimation Temperature

---

- **_Description_**: Temperature of sublimation of a substance.
- **_Units_**:
- **_Example_**: _in progress_

### Time Point

---

- **_Description_**: Time point, during the reaction time, for a sample being analyzed.
- **_Units_**:
- **_Example_**:

```cmdl{2}
sample Test-I-123B {
   time_point: 5 s;

   nmr Test-I-123B-nmr {
      nmr_nuclei: "1H";

      @lLactide {
         conversion: 99%;
      };

      @mPEG-PLLA.PLLA_Block.p_lLac {
         degree_poly: 80;
      }
   };
}
```

### Treatment Concentration

---

- **_Description_**: Concentration at which a chemical compound or material is administered.
- **_Units_**:
- **_Example_**: _in progress_

### Temperature

---

- **_Description_**: Temperature of a substance or process.
- **_Units_**:
- **_Example_**:

```cmdl{1}
reaction BatchRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @kOtBu {
      moles: 0.3 mmol;
      roles: [ "catalyst", "reagent" ];
   };
}
```

### Wavelength

---

- **_Description_**: Wavelength of a light-driven process
- **_Units_**:
- **_Example_**: _in progress_

### Wavenumber

---

- **_Description_**: Wavenumber of a stretching frequency
- **_Units_**:
- **_Example_**: _in progress_

### Volume

---

- **_Description_**: Volume of a chemical or reactor
- **_Units_**:
- **_Example_**:

```cmdl{1}
reaction BatchRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @THF {
      volume: 0.3 ml;
      roles: [ "solvent" ];
   };
}
```

### Yield

---

- **_Description_**: Yield of a chemical or material as determined by a given characterization technique.
- **_Units_**:
- **_Example_**:

```cmdl{2}
sample Test-I-123B {
   time_point: 5 s;

   nmr Test-I-123B-nmr {
      nmr_nuclei: "1H";

      @lLactide {
         conversion: 99%;
      };

      @mPEG-PLLA {
         yield: 80%;
      }
   };
}
```

### Zeta Potential

---

- **_Description_**: Zeta potential of a material.
- **_Units_**:
- **_Example_**: _in progress_
