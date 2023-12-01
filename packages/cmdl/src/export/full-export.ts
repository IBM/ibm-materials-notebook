import { TYPES } from "../cmdl-types";

/**
 * Material strategy
 * name: => stample Id
 * tags: string[]
 * source: string; => source file
 * metadata:{} hash from latest update
 * structure: {
 *    pSmiles: string[]
 *    graphStr: string
 *    bigSmiles: string
 * }
 * properties: {
 *  [prop]: value[] => value, unit, source?, technique?
 * }
 * charData: charData[] => technique, file reference, sampleId, date, time, etc.
 */

export type CompiledRecord = {
  date: string | null;
  name: string;
  temperature: TYPES.NumericQty | null;
  time: TYPES.NumericQty | null;
  chemicals: TYPES.ReactionChemicalOutput[];
  protocol: string | null;
  results: TYPES.ResultExport[];
  charData: TYPES.CharDataExport[];
  repository: {
    name?: string;
    commitSha?: string;
    fileSha?: string;
    filename: string;
    dateCreated: string;
    fileuri: string;
  };
};

/**
 * Default export => one reaction + results + chardata + protocol
 */
export class FullRecordExport {
  reaction: TYPES.ReactionExport;
  results: TYPES.ResultExport[] = [];
  charData: TYPES.CharDataExport[] = [];
  filename: string;
  uri: string;

  constructor(rxn: TYPES.ReactionExport, filename: string, uri: string) {
    this.reaction = rxn;
    this.filename = filename;
    this.uri = uri;
  }

  public compile(): CompiledRecord {
    return {
      date: this.reaction.date || null,
      name: this.reaction.name,
      temperature: this.reaction.temperature || null,
      time: this.reaction.reaction_time || null,
      chemicals: this.reaction.reactants,
      protocol: this.reaction.protocol || null,
      results: this.results,
      charData: this.charData,
      repository: {
        filename: this.filename,
        fileuri: this.uri,
        dateCreated: new Date(Date.now()).toISOString(),
      },
    };
  }
}
