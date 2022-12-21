# Import Tutorial

::: warning
The `import` API is under active development. It is stable enough to use in for documenting experimental work, but there will likely breaking changes in the not too distant future to streamline the usability of this feature.
:::

## Introduction

Importing references is a more facile for documenting information flow in an notebook document. Currently, imports are centrally managed by the IBM materials Notebook extension which will look for the `/lib` and `/exp` directories in the workspace folder for JSON files. These files will be parsed into an in-memory database for referencing in experimental notebooks.

Because of this, it is recommended that experimental notebook data is organized around specific projects or physical notebooks, such that these documents can re-use the similar chemical documents.

## Setup

To demonstrate the `import` feature of IBM Materials Notebooks, setup a new blank workspace folder as described in the [guide introduction](README.md#general-setup)

Once that is setup, copy the notebook prepared in the [batch experiment tutorial](tutorial.md) into the new workspace folder. Or, you may copy the completed notebook provided in the `/examples/batch_tutorial` directory on the IBM Materials Notebook GitHub repository.

Finally, we will need to provide the workspace with JSON data of chemicals to import. These files can be copied from the `/lib` directory in the the `/examples/import_tutorial` onf the GitHub repository. Once these files have been copied over, close and reload the workspace folder, which will allow the extension to load the new data into the in-memory database.

## Converting the Batch Experiment to use Imports

As a start, lets first convert the batch experiment notebook to use imported references instead of explicitly defining each chemical, material, or graph reference.

With the batch experiment notebook open, delete cells containing all chemical, fragment, and polymer graph definitions for:

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
import 3S-6S-3-6-dimethyl-1-4-dioxane-2-5-dione from "cmdl.lib";
import mPEG_Graph from "cmdl.lib";
import mPEG_PLLA_Graph from "cmdl.lib";

```

The CMDL syntax for imports utilizes the `import` and `from` keywords. Available imports are suggested through a VS Code completion provider. Importing from sources aside from the built in import manager `"cmdl.lib"` are currently not supported, but this will change in future versions of the extension and CMDL language.

For a reference to be properly recognized and utilized by the CMDL interpreter, it must have some of the required fields depending on the reference type. For examples of currently supported schema, please refer to the CMDL guide on imports.

Executing the cell will complete the import of the references, however errors will remain as the name of the imported references do match those defined in the experimental notebook.

### Import Aliasing

Similar to variables in programming languages, reference names should be unique. All references globally scoped (along with other named groups such as `samples` or `reaction`). However, many chemical names—especially IUPAC names—are poorly suited to be handles inside CDML or other languages, given the propensity to be overly long or contain many non-alphanumeric characters.

To get around this, we can use import aliasing using the `as` keyword to provide a more convient abbreviation for different reagent names. Aliases remain local to experiment notebook and the fullname, along with its alias are written to the experiment output.

Change the above example to use aliasing:

```cmdl{1,3}
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import 3S-6S-3-6-dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import mPEG_Graph from "cmdl.lib";
import mPEG_PLLA_Graph from "cmdl.lib";

```

With this correction the remaining errors should go away and the remainder of the cells in the notebook can be re-run. Saving the notebook will save a copy of the output to the `/output` directory.

## Chain Extension Tutorial

In many experiments in both polymer chemistry and small-molecule chemistry, the product of one experiment is used as a starting material in another. To allow for this, we can import the output of one experiment into another in the same workspace. **Note**: As with other features in the `import` API, this feature will likely be changed and improved over time.

### Experiment Setup

To demonstrate this feature, we will create a chain extension experiment. In the same workspace as the modified batch experiment, create a new notebook document and title it `chain_extension.cmdnb`.

For this example, we'll use the many of the same reagents as the previous batch experiment. In a new cell in the `chain_extension` notebook, add the following:

```cmdl
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import 3S-6S-3-6-dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import mPEG_PLLA_Graph from "cmdl.lib";
```

We will also define a new polymer product reference that will look identical to the batch experiment one. This gives a fresh instance to attach new results to based off of the outcome of the chain extension reaction.

```cmdl
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import 3S-6S-3-6-dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import mPEG_PLLA_Graph from "cmdl.lib";

polymer mPEG-PLLA {
   tree: @PEG_PLLA_Graph;

   @PEG_PLLA_Graph.PEG_Block.p_PEO {
      degree_poly: 112.8
   };
}
```

### Importing the Product from the Batch Experiment

To complete the references we can import the product form the batch experiment. Here the import will be coming from `/exp` directory. Imports from this directory are labeled by their sample id given to them in the experiment notebook to help distinguish them from other product(s) from the same experiment and products from different experiments in the same workspace.

We can modify the imports to include `TEST-I-123B` which would correspond to the final product from the prior batch experiment.

```cmdl{5}
import tetrahydrofuran as THF from "cmdl.lib";
import potassium_tert-butoxide as kOtBu from "cmdl.lib";
import 3S-6S-3-6-dimethyl-1-4-dioxane-2-5-dione as lLactide from "cmdl.lib";
import mPEG_PLLA_Graph from "cmdl.lib";
import TEST-I-123B from "cmdl.lib";

polymer mPEG-PLLA {
   tree: @PEG_PLLA_Graph;

   @PEG_PLLA_Graph.PEG_Block.p_PEO {
      degree_poly: 112.8
   };
}
```

Note that we do not assign a value for the DP<sub>n</sub> of the lactide block in the `mPEG-PLLA` definition even though technically it is already somewhat defined by the starting material `TEST-I-123B`. Since this block is being extended with an identical monomer, we can add the DP<sub>n</sub> during the characterization phase for this case. Were we creating a block copolymer with a different monomer we would then probably define the DP<sub>n</sub>.

Make sure to execute the cell to complete the import process.

### Defining the Chain Extension Reaction

With the references properly defined. We can create the chain extension `reaction` group. In a new cell define the reaction as follows:

```cmdl
reaction ChainRxn {
   temperature: 22 degC;
   reaction_time: 10 s;

   @TEST-I-123 {
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

Running the cell will produce an output similar to the following:

_screenshot of cell output_

### Defining the Characterization Samples and Experiment metadata

With the `reaction` object in place, we can add a cell to define the results and also add the metadata of any characterization techniques. In a new cell add the following:

```cmdl
sample Test-I-124A {
   time_point: 10 s;

   nmr Test-I-124A-nmr {
      nmr_nuclei: "1H";

      @lLactide {
         conversion: 99%;
      };

      @mPEG-PLLA.PLLA_Block.p_lLac {
         degree_poly: 160;
      }
   };

   gpc Test-I-124A-gpc {

      @mPEG-PLLA {
         dispersity: 1.65;
         mn_avg: 28000 g/mol;
      };

   };
}
```

To another cell add the experiment metadata:

```cmdl
metadata {
   title: "Chain Extension Experiment Tutorial";
   date: "11/18/22";
   exp_id: `Test-I-124`;
   template: `batch_experiment`;
}
```

Running the cells and saving should generate a new record in the `/output` and `/exp` directories.

### Next Steps

Now that we have completed batch experiments, we can move on to the final tutorial on how to define and execute [continuous-flow experiments](flow_exp_tutorial.md).
