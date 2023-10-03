/**
 * Removes double quotes from string images after tokenization of CMDL
 * @param strImage string
 * @returns string
 */
export function parseStringImage(strImage: string) {
  return strImage.slice(1, strImage.length - 1);
}
