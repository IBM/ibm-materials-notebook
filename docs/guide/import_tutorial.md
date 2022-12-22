# Import Tutorial

::: warning
The `import` API is under active development. It is stable enough to use in for documenting experimental work, but there will likely breaking changes in the not too distant future to streamline the usability of this feature.
:::

## Introduction

Importing references is a more facile for documenting information flow in an notebook document. Currently, imports are centrally managed by the IBM materials Notebook extension which will look for the `/lib` and `/exp` directories in the workspace folder for JSON files. These files will be parsed into an in-memory database for referencing in experimental notebooks.

Because of this, it is recommended that experimental notebook data is organized around specific projects or physical notebooks, such that these documents can re-use the similar chemical documents.

Here we will demonstrate the use of the `import` keyword in the context of a chain extension experiment in polymer chemistry.

## Setup

To demonstrate the `import` feature of IBM Materials Notebooks, make a copy of the batch tutorial notebook and save it as `batch_exp_import.cmdnb` in the same workspace used for the [batch experiment tutorial](tutorial.md). Or, you may copy the completed notebook provided in the `/examples/batch_tutorial` directory on the [IBM Materials Notebook GitHub repository](https://github.com/IBM/ibm-materials-notebook).

Finally, we will need ensure to provide the workspace with JSON data of chemicals to import. These files can be copied from the `/lib` and `/exp` directory in the the `/examples/batch_tutorial` on the [IBM Materials Notebook GitHub repository](https://github.com/IBM/ibm-materials-notebook). Once these files have been copied over, close and reload the workspace folder, which will allow the extension to load the new data into the in-memory database.

**Note**: If you have completed and ran successfully the notebook from the `batch tutorial` then the needed file from the `/exp` directory should already be present.

## Converting the Batch Experiment to use Imports

As a start, lets first convert the copied notebook to use imported references instead of explicitly defining each chemical, material, or graph reference.

With the `batch_exp_import.cmdnb` notebook open, delete cells containing all chemical, fragment, and polymer graph definitions for:

1. `THF`
2. `lLactide`
3. `kOtBu`
4. `eg_MeO`
5. `p_PEO`
6. `p_lLac`
7. `PEG_BASE`
8. `PEG_PLLA_Base`

Now you should be seeing a lot of errors appear as the CDML compiler will recognize that many references are now missing. In a new cell at the top of the notebook, add the following imports:

```cmdl
import tetrahydrofuran from "cmdl.lib";
import potassium_tert-butoxide from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione from "cmdl.lib";
```

The CMDL syntax for imports utilizes the `import` and `from` keywords. Available imports are suggested through a VS Code completion provider. Importing from sources aside from the built in import manager `"cmdl.lib"` are currently not supported, but this will change in future versions of the extension and CMDL language.

For a reference to be properly recognized and utilized by the CMDL interpreter, it must have some of the required fields depending on the reference type. For examples of currently supported schema, please refer to the CMDL guide on imports.

### Import Aliasing

Similar to variables in programming languages, reference names should be unique and not start with a number. All references globally scoped (along with other named groups such as `samples` or `reaction`). However, many chemical names—especially IUPAC names—are poorly suited to be handles inside CDML or other languages, given the propensity to be overly long or contain many non-alphanumeric characters.

To get around this, we can use import aliasing using the `as` keyword to provide a more convient abbreviation for different reagent names. Aliases remain local to experiment notebook and the fullname, along with its alias are written to the experiment output.

Change the above example to use aliasing:

```cmdl{1,3}
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
```

All of these references are defined in the `chemicals.JSON` file in the `/lib` directory of the workspace, which is automatically parsed and loaded upon activation of the extension in a new workspace. To complete the setup for the chain extension experiment in this tutorial, let's examine importing other references.

### Experiment Setup

First let's define the `polymer` reference for our targeted product of the chain extension reaction. This gives a fresh instance to attach new results to based off of the outcome of the chain extension reaction. Rather than re-defining the entire polymer graph, let's import the polymer graph and add it to a new `polymer` reference. Add the following line to the cell with imports:

```cmdl{4}
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import egMeO-p_PEO-p_LLac from "cmdl.lib";
```

Next, lets define the polymer reference and attach the existing `degree_poly` property for the poly(ethylene glycol) repeat unit in the graph representation.

```cmdl
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import egMeO-p_PEO-p_LLac from "cmdl.lib";

polymer mPEG-PLLA {
    tree: @egMeO-p_PEO-p_LLac;
    state: "solid";

    @egMeO-p_PEO-p_LLac.PEG_Block.p_PEO {
        degree_poly: 112.8;
    };
}
```

### Importing the Product from the Batch Experiment

To complete the references we can import the product form the batch experiment. Here the import will be coming from `/exp` directory. Imports from this directory are labeled by their sample id given to them in the experiment notebook to help distinguish them from other product(s) from the same experiment and products from different experiments in the same workspace.

We can modify the imports to include `Test-I-123A-mPEG-PLLA` which would correspond to the final product from the prior batch experiment.

```cmdl{5}
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import egMeO-p_PEO-p_LLac from "cmdl.lib";
import Test-I-123A-mPEG-PLLA from "cmdl.lib";

polymer mPEG-PLLA {
   tree: @PEG_PLLA_Graph;

   @PEG_PLLA_Graph.PEG_Block.p_PEO {
      degree_poly: 112.8
   };
}
```

Note that we do not assign a value for the DP<sub>n</sub> of the lactide block in the `mPEG-PLLA` definition even though technically it is already somewhat defined by the starting material `Test-I-123A-mPEG-PLLA`. Since this block is being extended with an identical monomer, we can add the DP<sub>n</sub> during the characterization phase for this case. Were we creating a block copolymer with a different monomer we would then probably define the DP<sub>n</sub>.

As a final bit of housekeeping we can add the `metadata` group as well to the import cell:

```cmdl
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import egMeO-p_PEO-p_LLac from "cmdl.lib";
import Test-I-123A-mPEG-PLLA from "cmdl.lib";

metadata {
    title: "Batch Experiment Tutorial";
    date: "11/18/22";
    exp_id: "Test-I-123";
    template: "batch_experiment";
}

polymer mPEG-PLLA {
    tree: @egMeO-p_PEO-p_LLac;
    state: "solid";

    @egMeO-p_PEO-p_LLac.PEG_Block.p_PEO {
        degree_poly: 112.8;
    };
}
```

Executing the the cell will complete the import process.

### Defining the Chain Extension Reaction

With the references properly defined. We can create the chain extension `reaction` group. In a new cell define the reaction as follows:

```cmdl
reaction ChainExt {
   temperature: 22 degC;
   reaction_time: 10 s;

   @Test-I-123A-mPEG-PLLA {
      mass: 135 mg;
      roles: ["initiator"];
   };

   @kOtBu {
      mass: 0.65 mg;
      roles: ["catalyst"];
   };

   @lLactide {
      mass: 144 mg;
      roles: ["monomer"];
   };

   @THF {
      volume: 2 ml;
      roles: ["solvent"];
   };

   @mPEG-PLLA {
      roles: ["product"];
   };
}
```

Running the cell will produce an output similar to the following:

![Chain Extension Reaction](/images/chain_ext.png)

### Defining the Characterization Samples and Experiment metadata

With the `reaction` object in place, we can add a cell to define the results and also add the metadata of any characterization techniques. In a new cell add the following:

```cmdl
sample Test-II-123A {
   time_point: 5 s;

   nmr Test-II-123A-nmr {
      nmr_nuclei: "1H";

      @lLactide {
         conversion: 80%;
      };

      @mPEG-PLLA.Lactide_Block.p_Llac {
         degree_poly: 347.5;
      };
   };

   gpc Test-II-123A-gpc {

      @mPEG-PLLA {
         dispersity: 1.4;
         mn_avg: 52000 g/mol;
      };

   };
}
```

Running the cells and saving should generate a new record in the `/output` and `/exp` directories.

### Next Steps

Now that we have completed batch experiments, we can move on to the final tutorial on how to define and execute [continuous-flow experiments](flow_exp_tutorial.md).
