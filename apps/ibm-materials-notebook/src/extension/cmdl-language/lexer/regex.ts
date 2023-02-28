export const IDENT_REGEX = /[_a-zA-Z0-9-\/%]+/;
export const LINK = /@[_a-zA-Z0-9-]+/;
export const VARIABLE = /\$[_a-zA-Z0-9-]+/;
export const VARIABLE_REF = /@\$[_a-zA-Z0-9-]+/;
export const STRING_LITERAL = /"(?:[^\"]|\\(?:[bfnrtv"\/]|u[0-9a-fA-F]{4}))+"/;

export const NUM_REGEX = /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/;
export const UNC_REGEX = /±|\+-/;
export const SMILES_REGEX =
  /([^J][0-9BCOHNSORQPrIFla@+\-\[\]\(\)\\\/%=#$,.~&!:]+)/i;
export const INCHI_REGEX = /((InChI=)[^J][0-9a-z+\-\(\)\\\/,]+)/i;
export const INCHIKEY_REGEX = /([0-9A-Z\-]+)/;
