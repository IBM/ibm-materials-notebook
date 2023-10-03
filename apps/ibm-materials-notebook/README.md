# IBM Materials Notebook

Custom notebook extension that utilizes a new domain specific language, Chemical Markdown Language (CMDL), to assist in documentation of experiments for small molecule chemistry and polymer chemistry.

Documentation and features for the extension and CMDL can be found here: https://ibm.github.io/ibm-materials-notebook/

![Notebook Screenshot](apps/docs/docs/.vuepress/public/images/notebook_screenshot.png)

The extension can be found on the VS Code Marketplace: https://marketplace.visualstudio.com/items?itemName=IBMMaterials.ibm-materials-notebook

## References

Preprint publication for concepts implemented within this extension can be found on [ChemRxiv](https://chemrxiv.org/engage/chemrxiv/article-details/62b60865e84dd185e60214af)

## Extension Settings

- `ibm-materials-notebook.library`: Set folder path for workspace `/lib` folder for importing references.

## Known Issues

- Member completion suggestion for non-imported polymer graphs requires fixing to provide correct suggestions.
- No ability to adjust chemical structure color themes in settings.

## Release Notes

### v0.1.3

    - Enabled workspace storage for persisting experiment outputs
    - Enabled adjustment of chemical structure theme
    - Added support for adding and validating BigSMILES strings to polymer definitions

### v0.1.5

    - Re-organization of CMDL language files and VS Code extension package
    – Updates to CMDL syntax
    — Improved sharing data via `imports`
    — Modification to how data is exported from workspaces
