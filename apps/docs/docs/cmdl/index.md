# Chemical Markdown Language

CMDL is a domain-specific language designed to be used for documentation of experimental results while leveraging the powerful text editing features that modern IDE's such as VS Code have to offer.

::: warning
IBM Materials Notebook is currently in `beta` stage. It's ready to be used for beginning to document experimental data, but the API will change as remaining features are added. Please see changelog for details.
:::

## Syntax

As CMDL exists primarily to assist in experimental documentation there are no control structures. Here, CMDL consists of two primary structures: Groups and Properties. Groups delinate groups of related properties where as properties specify specific values.

### Groups

Groups collect related proprties under a single term or keyword. An example is assigning SMILES strings for reference in polymer graphs:

```cmdl
fragments {
   MeO =: "CO[R]";
   PEO =: "[Q]OCC[R]";
   Llac =: "O=C(O[C@H](C([R])=O)C)[C@@H](O[Q])C";
}
```

Groups can also consist of a keyword followed by an identifier to create a reference to a specific entity such as a chemical or reactor. In this example, `chemical` is the keyword `THF` is identifier used to create a reference for the chemical `THF` with defined properties.

```cmdl{1}
chemical THF {
    molecular_weight: 72.11 g/mol;
    density: 0.8876 g/ml;
    state: "liquid";
    smiles: "C1CCOC1";
}
```

### Reference Groups

As with other programming languages, references may be referenced in different contexts to assign different values for a particular role. A simple example is referencing chemical entities within a reaction. Reference groups are prefaced with an `@`.

```cmdl{4-7}
reaction TEST_RXN {
    temperature: 22 degC;

    @THF {
        volume: 4 ml;
        roles: [ "solvent" ];
    };
}
```

For references that include a graph or tree representation such as reactor or a polymer reference. Members of the graph or tree representation can be referenced through dot notation. Below is an example of nmr experiment where the `conversion` of a `MonomerA` to the `PolymerProduct` is measured and a degree of polymerization (DP<sub>n</sub>, `degree_poly`) is assigned to a specific repeat unit of the `PolymerProduct` graph representation (highlighted).

```cmdl{9-11}
sample TEST_SAMPLE {

    nmr TEST_NMR_A {

        @MonomerA {
            conversion: 99%;
        };

        @PolymerProduct.RepeatUnitContainerA.RepeatUnitA {
            degree_poly: 35;
        };
    };
}
```

### Properties

Properties in CMDL represent a specific key-value pair. The syntax for properties is a the key or term followed by a colon and then the value. Values for properties can have several different types. These types and their acceptable values are enforced by the CMDL compilier.

#### Property Types

- Numerical values

Numerical values can have units or be unitless. The uncertainty of a value may also be recorded using `±` character

```cmdl{2,5}
reaction TEST_RXN {
    temperature: 22 degC;

    @ChemicalA {
        volume: 4.3±0.1 ml;
    };
}
```

- Text or string values

String or text values values for properties are enclosed within double quotes.

```cmdl{2}
chemical TEST {
    smiles: "CCCCCC";
}
```

- Lists of string values enclosed by square brackets

Properties that can have more than one string value are enclosed with square brackets and seperated by commas.

```cmdl{6}
reaction TEST_RXN {
    temperature: 22 degC;

    @ChemicalA {
        volume: 4.3±0.1 ml;
        roles: [ "monomer", "solvent" ]
    };
}
```

- Reference Properties

Property values may also be references and prefixed with an `@` character.

```cmdl{2,5}
flow_reaction TEST_RXN {
    reactor: @Test_Reactor;

    @MonomerSolution {
        input: @Test_Reactor.MonomerInput;
        flow_rate: 10 ml/min;
    };
}
```

- Reference List Properties

Property values may have multiple references.

```cmdl{2}
container Carbonate_Block {
    nodes: [ @Carbonate_Monomer_A, @Carbonate_Monomer_B ];
}
```

- Arrow Properties

Arrow properties are special properties used only in polymer graph definitions to create connections or edges between nodes. The following example denotes an arrow property for creating a self-referencing edge for a repeat unit in a polymer graph definition. `R` and `Q` properties refer to connection points on the SMILES string for `Carbonate_Monomer_A`.

```cmdl{4}
container Carbonate_Block {
    nodes: [ @Carbonate_Monomer_A ];

    <@Carbonate_Monomer_A.R  => @Carbonate_Monomer_A.Q>;

}
```

## CMDL Compilier

The CMDL compilier provides type checking on all groups and properties. This is to provide validation on the user defined groups, properties, values and units. In particular will check to ensure defined values are within allowable ranges, no duplication of groups, properties, or references.
