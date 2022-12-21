import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { parserInstance } from './parser';
import { generateCstDts } from 'chevrotain';

//script to generate chervortain token node types
export const productions = parserInstance.getGAstProductions();
const dtsString = generateCstDts(productions);
const dtsPath = resolve(__dirname, '.', 'cmdl_parser.d.ts');
writeFileSync(dtsPath, dtsString);
