import { SvgDrawer, parse } from "./smiles-drawer";

/**
 * Function to render SMILES in canvas elements
 * @param smiles SMILES string to render
 * @param id id of HTML canvas element
 */
export const renderSMILES = (smiles: string, id: string): void => {
  try {
    const drawerInstance = new SvgDrawer({
      width: 200,
      height: 200,
    });

    parse(
      smiles,
      function (tree: any) {
        drawerInstance.draw(tree, `${id}`, "dark", false);
      },
      function (error: any) {
        console.warn(error);
      }
    );
  } catch (error) {
    console.log(error);
  }
};
