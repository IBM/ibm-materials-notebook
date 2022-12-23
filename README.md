# IBM Materials Notebook

Custom notebook extension that utilizes a new domain specific language, Chemical Markdown Language (CMDL), to assist in documentation of experiments for small molecule chemistry and polymer chemistry.

Documentation and features for the extension and CMDL can be found here: https://ibm.github.io/ibm-materials-notebook/

![Notebook Screenshot](/docs/.vuepress/public/images/notebook_screenshot.png)

The extension can be found on the VS Code Marketplace here: https://marketplace.visualstudio.com/items?itemName=IBMMaterials.ibm-materials-notebook

## References

Initial pre-print publication for concepts implemented within this extension can be found on [ChemRxiv](https://chemrxiv.org/engage/chemrxiv/article-details/62b60865e84dd185e60214af)

Chemical structures are rendered in the notebook extension using a small TypeScript adaptation of [SmilesDrawer](https://github.com/reymond-group/smilesDrawer). The published manuscript of SmilesDrawer can be found [here](https://pubs.acs.org/doi/10.1021/acs.jcim.7b00425).

## Extension Settings

- `ibm-materials-notebook.library`: Set folder path for workspace `/lib` folder for importing references.
- `ibm-materials-notebook.exp`: Set folder path for workspace `/exp` folder for importing result references from other experiments in same workspace.
- `ibm-materials-notebook.output`: Set folder path for JSON output of notebook document.

## Known Issues

- Member completion suggestion for non-imported polymer graphs requires fixing to provide correct suggestions

## Release Notes
