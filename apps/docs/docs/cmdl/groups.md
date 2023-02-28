# CMDL Groups

[[toc]]

### Analytical Balance

---

- **_Description_**: Measurements using an analytical balance
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Yield](properties.md#yield)
  - [Mass](properties.md#mass)
- **_Properties_**: None
- **_Example_**:

```cmdl{3-8}
    sample Exp-I-1A {

        analytical_balance Exp-I-1A-mass {
            @Product_A {
                yield: 60%;
                mass: 600 mg;
            };
        };
    }
```

### Assay

---

**_currently under development_**

- **_Description_**: Biological assay of polymer or small-molecule compounds
- **_Member Of_**: None
- **_Properties_**: _in progress_
- **_Example_**: _in progress_

### Chemical

---

- **_Description_**: Describes a small-molecule chemical reference for use in an experiment.
- **_Member Of_**: None
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Molecular Weight](properties.md#molecular-weight)
  - [Density](properties.md#density)
  - [State](properties.md#physical-state)
  - [SMILES](properties.md#smiles)
  - [InChi]()
  - [InChi Key](properties.md#inchi-key)
- **_Example_**:

  ```cmdl
  chemical lLactide {
      molecular_weight: 144.12 g/mol;
      state: "solid";
      smiles: "C[C@H]1C(=O)O[C@H](C(=O)O1)C";
  }
  ```

### Complex

---

- **_Description_**: Describes a reference of a macromolecular complex for use in experiments and assays. May consist of both polymeric and small-molecule components.
- **_Member Of_**: None
- **_Reference Group Properties_**:
  - [Ratio](properties.md#ratio)
- **_Properties_**:
  - [Critical Micelle Concentration]()
  - [Hydrodynamic Radius](properties.md#hydrodynamic-radius)
  - [Hydrodynamic Radius Dispersity](properties.md#hydrodynamic-radius-dispersity)
  - [Loading Capacity](properties.md#loading-capacity)
- **_Example_**:

### Component

---

- **_Description_**: Describes a physical component in a continuous flow reactor.
- **_Member Of_**:
  - [Reactor Graph](#reactor-graph)
  - [Reactor](#reactor)
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Length](properties.md#length)
  - [Volume](properties.md#volume)
  - [Inner Diameter](properties.md#inner-diameter)
  - [Outer Diameter](properties.md#outer-diameter)
- **_Example_**:

  **Note**: The following illustrate valid arrangements of the `component` group. For more detailed description of a `reactor_graph` setup see the [flow reaction tutorial](../guide/flow_exp_tutorial.md).

  ```cmdl{3-6,8-13}
  reactor_graph FlowReactorA {
      reactor PolymerizationReactor {
          component Mixer {
              description: "PEEK T-Mixer (0.05 cm ID)";
              inner_diameter: 0.05 cm;
          };

          component Reactor_Tubing {
              description: "PFA Reactor Tubing (14 cm, 0.05 cm ID)";
              inner_diameter: 0.05 cm;
              length: 14 cm;
              volume: 0.02749 ml;
          };
      };
  }
  ```

  ```cmdl{2-6}
  reactor_graph FlowReactorA {
      component Monomer_Syringe {
        description: "NormJect Syringe (10 mL)";
  	    volume: 10 ml;
  	    target: @Monomer_Pump;
    };
  }
  ```

### Container

---

- **_Description_**: Describes a container group in a `polymer_graph` representation. Contains references to edges, nodes, and other `container` groups for describing the polymer structure
- **_Member Of_**:
  - [Polymer Graph](#polymer-graph)
  - [Container](#container)
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Nodes]()
  - [Connections]()
- **_Example_**:

  ```cmdl{5-8}
  polymer_graph mPEG_Graph {
      nodes: [ @eg_MeO ];
      <@eg_MeO.R => @PEG_Block.p_PEO.R>;

      container PEG_Block {
          nodes: [ @p_PEO ]
          <@p_PEO.Q => @p_PEO.R>;
      };
  }
  ```

### Differential Scanning Calorimetry

---

- **_Description_**: Differential scanning calorimetry to measure various thermal properties of a small-molecule chemical or polymeric material.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Crystalization Temperature](properties.md#crystallization-temperature)
  - [Melting Temperature](properties.md#melting-temperature)
  - [Glass Transition Temperature](properties.md#glass-transition-temperature)
- **_Properties_**:
  - [File]()
  - [Heating Rate]()
- **_Example_**:

  **Note**: `file` property is still under active development.

  ```cmdl{3-11}
      sample Exp-I-1A {

          dsc Exp-I-1A-dsc {
              file: @DSC_Trace_A;
              heating_rate: 10 degC/min;

              @Polymer_Product_A {
                  temp_melt: 150 degC;
                  temp_glass: 60 degC;
              };
          };
      }
  ```

### Dynamic Light Scattering

---

- **_Description_**: Measurement of `polymer` or `complex` properties using dynamic light scattering,
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Hydrodynamic Diameter](properties.md#hydrodynamic-diameter)
  - [Hydrodynamic Diameter Dispersity](properties.md#hydrodynamic-diameter-dispersity)
  - [Zeta Potential](properties.md#zeta-potential)
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{3-11}
    sample Exp-I-1A {

        dls Exp-I-1A-dls {
            file: @DLS_File_A;

            @Polymer_Product_A {
                Dh: 100±1 nm;
                Dh_pdi: 0.2±1;
                zeta_potential: -0.3 mV;
            };
        };
    }
  ```

### Flow Reaction

---

- **_Description_**:
- **_Member Of_**:
- **_Properties_**:
- **_Example_**:

### Fluorescence Spectroscopy

---

- **_Description_**: Measurements of fluoresence properties of a polymer or chemical compound.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [CMC]()
  - [Lamda Max Absorption](properties.md#lambda-max-absorbtion)
  - [Lamda Max Emission](properties.md#lamda-max-emission)
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{3-10}
      sample Exp-I-1A {

          fluoresence Exp-I-1A-fluor {
              file: @Fluor_File_A;

              @Polymer_Product_A {
                  lamda_max_abs: 300 nm;
                  lamda_max_ems: 400 nm;
              };
          };
      }
  ```

### Fragment

---

- **_Description_**: A fragment is a discrete chemical entity, such as an end group or repeate unit, that may be referenced one or more times within a polymer graph representation.
- **_Member Of_**: None
- **_Properties_**:
  - [SMILES](properties.md#smiles)
  - [Molecular Weight](properties.md#molecular-weight)
- **_Example_**:

  ```cmdl
      fragment p_PEO {
          molecular_weight: 44.05 g/mol;
          smiles: "[Q]OCC[R]";

          point R {
              quantity: 1;
          };

          point Q {
              quantity: 1;
          };
      }
  ```

### Gas Chromatography

---

- **_Description_**: Gas chromatography measurements of small-molecule compounds.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Conversion](properties.md#conversion)
  - [Yield](properties.md#yield)
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{4-10}
    sample Exp-I-1A {
        time_point: 20 s;

        gc Exp-I-1A-gc {
            file: @GC_File_A;

            @Product_A {
                conversion: 30%;
            };
        };
    }
  ```

### Gel Permeation Chromatography

---

- **_Description_**: Gel permeation or size-exclusion chromatography measurements of polymeric materials.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Dispersity](properties.md#dispersity)
  - [M<sub>n</sub>](properties.md#mn)
  - [M<sub>w</sub>](properties.md#mw)
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{4-12}
    sample Exp-I-1A {
        time_point: 40 s;

        gpc Exp-I-1A-gpc {
            file: @GPC_File_A;

            @Polymer_Product_A {
                dispersity: 1.2;
                mn_avg: 16000;
                mw_avg: 19200;
            };
        };
    }
  ```

### High Performance Liquid Chromatography

---

- **_Description_**: High performance liquid chromatography measurments of small-molecule chemical compounds.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Loading Capacity](properties.md#loading-capacity)
- **_Properties_**:
  - [File]()
- **_Example_**:

```cmdl{4-12}
sample Exp-I-1A {
    time_point: 40 s;

    hplc Exp-I-1A-hplc {
        file: @HPLC_File_A;

        @Complex_A.Cargo {
            loading_capacity: 10 wt%;
        };
    };
}
```

### Infrared Spectroscopy

---

- **_Description_**: Infrared spectroscopy measurements of polymeric or small-molecule chemical compounds.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Conversion](properties.md#conversion)
  - [Yield](properties.md#yield)
- **_Properties_**:
  - [File]()
- **_Example_**:

```cmdl{4-12}
sample Exp-I-1A {
    time_point: 40 s;

    ir Exp-I-1A-ir {
        file: @IR_File_A;

        @Compound_A {
            conversion: 20%;
        };
    };
}
```

### Matrix Assisted Laser Desorption Ionization Spectroscopy

---

- **_Description_**: MALDI measurements of polymeric materials.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{4-6}
    sample Exp-I-1A {
        time_point: 40 s;

        maldi Exp-I-1A-maldi {
            file: @MALDI_File_A;
        };
    }
  ```

### Metadata

---

- **_Description_**: Metadata definition for the notebook document.
- **_Member Of_**: None
- **_Properties_**:
  - [Title](properties.md#title)
  - [Date](properties.md#date)
  - [Owner](properties.md#owner)
  - [Template](properties.md#template-type)
  - [Tags](properties.md#tags)
  - [Record ID](properties.md#record-id)
  - [Experiment ID](properties.md#experiment-id)
- **_Example_**:

  ```cmdl
  metadata {
      title: "Batch Experiment";
      date: "11/22/22";
      exp_id: `EXP-I-123`;
      template: `batch_experiment`;
  }
  ```

### Microplate Reader

---

- **_Description_**: Microplate reader for biological assay measurements.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [MIC](properties.md#minimum-inhibitory-concentration)
  - [HC50](properties.md#hc50)
- **_Properties_**:
  - [File]()
- **_Example_**: _Under Development_

### Nuclear Magnetic Resonance Spectroscopy

---

- **_Description_**: NMR measurements of small-molecule and polymeric components.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Conversion](properties.md#conversion)
  - [Yield](properties.md#yield)
- **_Properties_**:
  - [File]()
- **_Example_**:

```cmdl{4-12}
      sample Exp-I-1A {
          time_point: 40 s;

          nmr Exp-I-1A-nmr {
              file: @NMR_File_A;

              @Compound_A {
                  conversion: 20%;
              };

              @Compound_B {
                  yield: 18%;
              };
          };
      }
```

### Point

---

- **_Description_**: Defines a connection point within a SMILES string for a fragement.
- **_Member Of_**:
  - [Fragment](groups.md#fragment)
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Quantity](properties.md#quantity)
- **_Example_**:

  ```cmdl{5-7,9-11}
    fragment p_PEO {
        molecular_weight: 44.05 g/mol;
        smiles: "[Q]OCC[R]";

        point R {
            quantity: 1;
        };

        point Q {
            quantity: 1;
        };
    }
  ```

### Polymer

---

- **_Description_**: Defines a polymer reference for use within an experiment record.
- **_Member Of_**: None
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [M<sub>n</sub>](properties.md#mn)
  - [M<sub>w</sub>](properties.md#mw)
  - [Dispersity](properties.md#dispersity)
  - [State](properties.md#physical-state)
  - [Tree](properties.md#tree)
  - [BigSMILES](properties.md#bigsmiles)
- **_Example_**:

  ```cmdl
    polymer mPEG-OH {
        tree: @PEG_BASE;
        mn_avg: 5000 g/mol;

        @PEG_BASE.PEG_Block.p_PEO {
            degree_poly: 112.8
        };
    }
  ```

### Polymer Graph

---

- **_Description_**: Defines a graph representation for a polymeric material.
- **_Member Of_**: None
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Nodes]()
  - [Connections]()
- **_Example_**:

  ```cmdl
  polymer_graph PEG_PLLA_Base {
      nodes: [ @eg_MeO ];
      <@eg_MeO.R => @PEG_Block.p_PEO.R>;

      container PEG_Block {
          nodes: [ @p_PEO ];
          <@p_PEO.Q => @p_PEO.R>;
      };

      container PLLA_Block {
          nodes: [ @p_Llac ];
          <@p_Llac.Q => @p_Llac.R>;
      };
  }
  ```

### Raman Spectroscopy

---

- **_Description_**: Raman measurements on small-molecule and polymer components
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Conversion](properties.md#conversion)
  - [Yield](properties.md#yield)
- **_Properties_**:
  - [File]()
- **_Example_**:

```cmdl{4-12}
sample Exp-I-1A {
    time_point: 40 s;

    raman Exp-I-1A-raman {
        file: @RAMAN_File_A;

        @Compound_A {
            conversion: 20%;
        };

        @Compound_B {
            yield: 18%;
        };
    };
}
```

### Reaction

---

- **_Description_**: Defines a batch reaction for an experimental record.
- **_Member Of_**: None
- **_Reference Group Properties_**:
  - [Mass](properties.md#mass)
  - [Volume](properties.md#volume)
  - [Moles](properties.md#moles)
  - [Pressure](properties.md#pressure)
  - [Roles](properties.md#reaction-roles)
- **_Properties_**:
  - [Temperature](properties.md#temperature)
  - [Volume](properties.md#volume)
  - [Reaction Time](properties.md#reaction-time)
- **_Example_**:

  ```cmdl
  reaction BatchRxn {
      temperature: 22 degC;
      reaction_time: 10 s;

      @mPEG-OH {
          mass: 5 mg;
          roles: [ "initiator" ];
          limiting: true;
      };

      @kOtBu {
          mass: 5 mg;
          roles: [ "catalyst", "reagent" ];
      };

      @lLactide {
          mass: 1440 mg;
          roles: [ "monomer" ];
      };

      @THF {
          volume: 2 ml;
          roles: [ "solvent" ];
      };

      @mPEG-PLLA {
          roles: [ "product" ];
      };
  }
  ```

### Reactor

---

- **_Description_**: Defines a container for component elements that belong to a single reactor element within a reactor graph. Treated as a single volume for computing residence times and stoichiometry.
- **_Member Of_**:
  - [Reactor Graph](#reactor-graph)
- **_Reference Group Properties_**: None
- **_Properties_**: None
- **_Example_**:

  **Note**: The following example would be nested inside a [reactor graph](#reactor-graph)

  ```cmdl
  reactor PolymerizationReactor {
      component Mixer {
          description: "PEEK T-Mixer (0.05 cm ID)";
          inner_diameter: 0.05 cm;
      };

      component Reactor_Tubing {
          description: "PFA Reactor Tubing (14 cm, 0.05 cm ID)";
          inner_diameter: 0.05 cm;
          length: 14 cm;
          volume: 0.02749 ml;
      };
  };
  ```

### Reactor Graph

---

- **_Description_**: Defines a reactor graph representation that can be used within a flow reaction group.
- **_Member Of_**: None
- **_Reference Group Properties_**: None
- **_Properties_**: None
- **_Example_**:

  ```cmdl
  reactor_graph FlowReactorA {
      reactor PolymerizationReactor {
          component Mixer {
              description: "PEEK T-Mixer (0.05 cm ID)";
              inner_diameter: 0.05 cm;
          };

          component Reactor_Tubing {
              description: "PFA Reactor Tubing (14 cm, 0.05 cm ID)";
              inner_diameter: 0.05 cm;
              length: 14 cm;
              volume: 0.02749 ml;
          };
      };
  }
  ```

### Sample

---

- **_Description_**: Describes a container for all analyses for a single sample, either a crude sample from a reaction mixture or purified sample.
- **_Member Of_**: None
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Time Point](properties.md#time-point)
  - [Date](properties.md#date)
- **_Example_**:

  ```cmdl{4-12}
    sample Exp-I-1A {
        date: "11/11/22";
        time_point: 40 s;
    }
  ```

### Solution

---

- **_Description_**: Describes a stock solution of reagents for use in a flow reaction.
- **_Member Of_**: None
- **_Reference Group Properties_**:
  - [Mass](properties.md#mass)
  - [Volume](properties.md#volume)
  - [Moles](properties.md#moles)
  - [Pressure](properties.md#pressure)
  - [Roles](properties.md#reaction-roles)
- **_Properties_**: None
- **_Example_**:

  ```cmdl
    solution Catalyst_Solution {
        @KOMe {
            mass: 144 mg;
            roles: [ "catalyst" ];
        };

        @UreaCatalyst {
            mass: 500 mg;
            roles: [ "catalyst" ];
        };

        @THF {
            volume: 8 ml;
            roles: [ "solvent" ];
        };
    }
  ```

### Source

---

- **_Description_**: Describes a journal article or notebook source for a particular experiment record.
- **_Member Of_**:
  - [Metadata](#metadata)
- **_Reference Group Properties_**: None
- **_Properties_**:
  - [Title](properties.md#title)
  - [Date](properties.md#date)
  - [Source Type](properties.md#source-type)
  - [DOI](properties.md#doi)
  - [Citation](properties.md#citation)
- **_Example_**:

  ```cmdl
      metadata {
          source {
              title: "Example Notebook";
              source_type: "Notebook";
              date: "11/22/18";
          }
      }
  ```

### UV-Vis Spectroscopy

---

- **_Description_**: UV-Vis spectroscopic measurements of small-molecule and macromolecular compounds.
- **_Member Of_**:
  - [Sample](#sample)
- **_Reference Group Properties_**:
  - [Conversion](properties.md#conversion)
  - [Yield](properties.md#yield)
  - [Loading Capacity](properties.md#loading-capacity)
- **_Properties_**:
  - [File]()
- **_Example_**:

  ```cmdl{4-12}
      sample Exp-I-1A {
          time_point: 40 s;

          uv_vis Exp-I-1A-uvVis {
              file: @UV_Vis_File_A;

              @Compound_B {
                  yield: 48%;
              };
          };
      }
  ```
