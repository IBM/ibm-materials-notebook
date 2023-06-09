import { TAGS, ITag } from './tag-types';

const atmosphere: ITag = {
  description: 'Atmosphere',
  detail: 'Atmosphere',
  name: TAGS.ATMOSPHERE,
  aliases: [],
};
const catalyst: ITag = {
  description: 'Catalyst',
  detail: 'Catalyst',
  name: TAGS.CATALYST,
  aliases: [],
};
const initiator: ITag = {
  description: 'Initiator',
  detail: 'Initiator',
  name: TAGS.INITIATOR,
  aliases: [],
};
const monomer: ITag = {
  description: 'Monomer',
  detail: 'Monomer',
  name: TAGS.MONOMER,
  aliases: [],
};
const product: ITag = {
  description: 'Product',
  detail: 'Product',
  name: TAGS.PRODUCT,
  aliases: [],
};
const reactant: ITag = {
  description: 'Reactant',
  detail: 'Reactant',
  name: TAGS.REACTANT,
  aliases: [],
};
const reagent: ITag = {
  description: 'Reagent',
  detail: 'Reagent',
  name: TAGS.REAGENT,
  aliases: [],
};

const solvent: ITag = {
  description: 'Solvent',
  detail: 'Solvent',
  name: TAGS.SOLVENT,
  aliases: [],
};

const proton: ITag = {
  description: '1H NMR',
  detail: '1H NMR',
  name: TAGS.H,
  aliases: [],
};
const carbon: ITag = {
  description: '13C NMR',
  detail: '13C NMR',
  name: TAGS.C,
  aliases: [],
};
const nitrogen: ITag = {
  description: '15N NMR',
  detail: '15N NMR',
  name: TAGS.N,
  aliases: [],
};
const fluorine: ITag = {
  description: '19F NMR',
  detail: '19F NMR',
  name: TAGS.F,
  aliases: [],
};
const phosphorus: ITag = {
  description: '31P NMR',
  detail: '31P NMR',
  name: TAGS.P,
  aliases: [],
};
const silicon: ITag = {
  description: '29Si NMR',
  detail: '29Si NMR',
  name: TAGS.Si,
  aliases: [],
};

export const categoricalTags = [
  atmosphere,
  catalyst,
  initiator,
  monomer,
  product,
  reactant,
  reagent,
  solvent,
  proton,
  carbon,
  nitrogen,
  fluorine,
  phosphorus,
  silicon,
];
