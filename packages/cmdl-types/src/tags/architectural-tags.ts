import { TAGS, ITag } from './tag-types';

const homopolymer: ITag = {
  description: 'Homopolymer',
  detail: 'Homopolymer',
  name: TAGS.HOMOPOLYMER,
  aliases: [],
};

const blockCopolymer: ITag = {
  description: 'Block copolymer',
  detail: 'Block copolymer',
  name: TAGS.BLOCK_COPOLYMER,
  aliases: [],
};

const statCopolymer: ITag = {
  description: 'Statistical Copolymer',
  detail: 'Statistical Copolymer',
  name: TAGS.STAT_COPOLYMER,
  aliases: [],
};

const graft: ITag = {
  description: 'Grafted polymer',
  detail: 'Grafted polymer',
  name: TAGS.GRAFT,
  aliases: [],
};

const brush: ITag = {
  description: 'Brush polymer',
  detail: 'Brush polymer',
  name: TAGS.BRUSH,
  aliases: [],
};

const linear: ITag = {
  description: 'Linear polymer',
  detail: 'Linear polymer',
  name: TAGS.LINEAR,
  aliases: [],
};

const cyclic: ITag = {
  description: 'Cyclic polymer',
  detail: 'Cyclic polymer',
  name: TAGS.CYCLIC,
  aliases: [],
};

const crossLinked: ITag = {
  description: 'Cross-linked polymer',
  detail: 'Cross-linked polymer',
  name: TAGS.CROSS_LINKED,
  aliases: [],
};

const star: ITag = {
  description: 'Star polymer',
  detail: 'Star polymer',
  name: TAGS.STAR,
  aliases: [],
};

const complex: ITag = {
  description: 'Complex',
  detail: 'Complex',
  name: TAGS.COMPLEX,
  aliases: [],
};

const mixedMicelles: ITag = {
  description: 'Mixed micelles',
  detail: 'Mixed micelles',
  name: TAGS.MIXED_MICELLES,
  aliases: [],
};

export const architectureTags = [
  homopolymer,
  blockCopolymer,
  statCopolymer,
  graft,
  brush,
  linear,
  star,
  complex,
  crossLinked,
  mixedMicelles,
  cyclic
];
