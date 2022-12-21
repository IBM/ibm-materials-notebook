# Introduction

IBM Materials Notebook is a custom notebook extension to [VS Code](https://code.visualstudio.com/) designed to facilitate facile recording of experimental data. Specifically, allowing the user to attach measured property values (e.g. conversion, yield, M<sub>n</sub>, dispersity, etc.) to outputs and inputs within a single experiment. The notebook uses a domain specific language termed Chemical Markdown Language (CMDL) to enable facile recording of experimental reaction data while enforcing allowable data types (see [CMDL](../cmdl/README.md)).

## General Setup

IBM Materials Notebook can be installed as a VS Code extension from the [extension marketplace](https://marketplace.visualstudio.com/VSCode). Workspaces for experimental data can be organized in a similar matter to other workspaces with a focus on a single project. Below is the default workspace setup.

```bash
└─ workspace
   ├─ exp # <- outputs from experiment record
   └─ lib # <- library of chemcials, polymers, reactors, etc.
   └─ output # <- output of compiled experimental record
```

The path and name for each of these folders can be changed in the VS Code extension settings. Currently, these folders are not automatically created for a experiment workspace and must be created by the user. Workspace templates and automated workspace setup will be part of forthcoming updates.

## Creating a Notebook

Once the workspace folder has been setup, the easiest way to create a new IBM Materials Notebook is through the VS Code Command Pallete.
The command pallete can be accessed using the keyboard shortcut: `command` + `shift` + `P`

![Create New Screenshot](/images/create_new_cmd.png)

After running the command a blank, untitled notebook document with the extension .cmdnb will be created in the workspace. The document can be renamed and saved.

![New Notebook](/images/new_notebook.png)

## Adding a CMDL Cell

By default, adding a new cell by clicking the new cell button on the notebook document (or useing a keyboard command) will create a new CMDL code cell.

<!-- ![Create New Cell](/images/create_new_cell.gif) -->

Now you may start writing CMDL directly into the cell. While it is certainly possible to enter in all the experimental values in a single CMDL cell, it is likely better to separate it accross multiple cells for ease of visualization and interpretation by others. See the [tutorial](./tutorial.md) for more details.

## Adding a Markdown Cell

As with other notebooking applications, markdown cells are also supported within CMDL notebooks. This allows users to add additional text, headers, titles, and links alongside CMDL cells, providing a rich medium for experimental data documentation and sharing. A markdown cell can be added in the same manner as a CMDL cell.

<!-- ![Create Markdown Cell](/images/create_markdown_cell.gif) -->

Alternatively, the cell type can also be changed. This is not recommended if CMDL text has already been entered.

<!-- ![Change Cell Type](/images/change_cell_type.gif) -->

::: warning
Currently the CMDL kernel does not interpret any text or data written into markdown cells and such data will not be exported to any compiled experimental record. This will likely change in future versions of the notebook extension. Stay tuned.
:::

## Further Information

For a full walkthrough on creating an experimental record using CMDL, check out the [tutorial](./tutorial.md). For a detailed overview of CMDL syntax and available terms, see the [CMDL section](../cmdl/README.md).
