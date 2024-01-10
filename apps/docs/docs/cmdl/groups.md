# CMDL Groups

:::warning
CMDL is undergoing significant revisions to improve conciseness and ease of use. This page will be undergoing updates as the type of CMDL groups is revised.
:::

[[toc]]

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

### Flow Reaction

---

- **_Description_**:
- **_Member Of_**:
- **_Properties_**:
- **_Example_**:

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
