import { logger } from "./logger";

/**
 * Serializes AI generated polymer representations to CMDL for SME inspection
 * TODO: generalize serializer to other data models
 */
export class CMDLSerializer {
  /**
   * Creates final cell containing all serialized data
   * @param rowItem object<string, string> structure and dispersity of a generated polymer
   * @param rowNumber number row number in batch of 50
   * @returns Object<string, string> serialized CMDL cell
   */
  public createGeneratedPolymerCell(
    rowItem: {
      structure: string;
      dispersity: string;
    },
    rowNumber: number
  ) {
    try {
      const cellText = this.serializeGeneratedPolymer(rowItem, rowNumber);
      logger.info(`completed serialization for row ${rowNumber}`);
      return { language: "cmdl", kind: 2, value: cellText };
    } catch (error) {
      throw new Error(
        `Unable to serialize row ${rowNumber}:\nstructure: ${rowItem.structure}\nerror: ${error}`
      );
    }
  }

  /**
   * Serializes polymer into CMDL
   * @param param contains structure and dispersity of polymer
   * @param rowNumber number
   * @returns Object serialized polymer
   */
  private serializeGeneratedPolymer(
    {
      structure,
      dispersity,
    }: {
      structure: string;
      dispersity: string;
    },
    rowNumber: number
  ) {
    try {
      const nodeGroups = this.parseGraphStr(structure);
      let fragments = "";

      for (const group of nodeGroups) {
        let newFragment = this.createFragment(group, rowNumber);
        fragments = `${fragments}\n${newFragment}`;
      }

      //create polymer graph
      const graphName = `BASE_${rowNumber}`;
      const graphHeader = `polymer_graph ${graphName} {\n`;
      const graphBody = this.createPolymerGraph(nodeGroups, rowNumber);
      const graphFooter = `\n}`;
      const polymerGraphStr = `${graphHeader}${graphBody}${graphFooter}`;

      //create polymer reference
      const polymerHeader = `polymer GEN_POLY_${rowNumber} {\n`;
      const polymerTreeProp = `\ttree: @${graphName};\n`;
      const dispersityProp = `\tdispersity: ${dispersity};\n`;
      const polyFooter = `\n}`;
      const fullPolymer = `${polymerHeader}${polymerTreeProp}${dispersityProp}${polyFooter}`;

      return `${fragments}\n${polymerGraphStr}\n${fullPolymer}`;
    } catch (error) {
      throw new Error(`Unable to serialize generated polymer:\n-${error}`);
    }
  }

  /**
   * Creates a polymer graph from node groups
   * @param nodeGroups string[][]
   * @param rowNumber number
   * @returns string
   */
  private createPolymerGraph(nodeGroups: string[][], rowNumber: number) {
    try {
      const groups = this.sortGroups(nodeGroups);
      const baseNodes = groups.baseGroups
        .map((el) => {
          const nodeId = this.stripBrackets(el[0]);
          return `@${nodeId}_${rowNumber}`;
        })
        .join(", ");
      const baseConnections = groups.baseGroups.map((el) => {
        let connArr = el.slice(2).map((el) => {
          let conn = el.split("->");
          let connStr = this.createConnection(conn, rowNumber);
          return connStr;
        });
        return connArr;
      });
      const baseNodeProp = `\tnodes: [ ${baseNodes} ];`;
      let connections = "";

      for (const connGroup of baseConnections) {
        for (const connection of connGroup) {
          connections = `${connections}\t${connection}`;
        }
      }

      let containers = "";

      for (const container of groups.containerGroups) {
        let containerStr = this.createContainer(container, rowNumber);
        containers = `${containers}\n${containerStr}`;
      }

      return `${baseNodeProp}\n${connections}\n${containers}`;
    } catch (error) {
      throw new Error(`Unable to serialize a polymer graph:\n-${error}`);
    }
  }

  /**
   * Creates and serializes a container component in a polymer graph
   * @param containerGroup string[]
   * @param rowNumber number
   * @returns string
   */
  private createContainer(containerGroup: string[], rowNumber: number) {
    try {
      const containerNode = this.stripBrackets(containerGroup[0]);
      const containerName = `Group_${containerNode}`;
      const header = `\tcontainer ${containerName} {\n`;
      const nodeProp = `\t\tnodes: [ @${containerNode}_${rowNumber} ];\n`;
      const connections = containerGroup
        .slice(2)
        .map((el) => {
          let conn = el.split("->");
          let connStr = this.createConnection(conn, rowNumber);
          return connStr;
        })
        .join("\t\t");
      const footer = `\t};`;
      logger.debug(`created a container group for ${containerNode}`);
      return `${header}${nodeProp}\t\t${connections}${footer}`;
    } catch (error) {
      throw new Error(`Unable to create a container:\n-${error}`);
    }
  }

  /**
   * Sorts node groups for polymer graph
   * @param nodeGroups string[][]
   * @returns string[][]
   */
  private sortGroups(nodeGroups: string[][]) {
    try {
      const connectionRegex = new RegExp(/\[R|Q|Z|X\]/g);
      let baseGroups = [];
      let containerGroups = [];
      for (const group of nodeGroups) {
        const nodeSmiles = group[1];
        const matches = nodeSmiles.match(connectionRegex);

        if (!matches) {
          baseGroups.push(group);
          continue;
        }

        if (matches.length > 1) {
          containerGroups.push(group);
        } else {
          baseGroups.push(group);
        }
      }
      const groups = { baseGroups, containerGroups };
      logger.debug(`completed group sorting`, { meta: groups });
      return groups;
    } catch (error) {
      throw new Error(
        `Unable to sort node groups for polymer graph:\n-${error}`
      );
    }
  }

  /**
   * Parses graph string for generated polymer
   * @param graphStr string
   * @returns string[][]
   */
  private parseGraphStr(graphStr: string) {
    try {
      const splitGroups = graphStr.split("><");

      splitGroups[0] = splitGroups[0].slice(1);
      splitGroups[splitGroups.length - 1] = splitGroups[
        splitGroups.length - 1
      ].slice(0, -1);

      const nodeGroups = splitGroups.map((group) => {
        return group.split(";");
      });

      logger.debug(`completed parsing of graph string...`, {
        meta: nodeGroups,
      });
      return nodeGroups;
    } catch (error) {
      throw new Error(`Unable to parse graph string:\n-${error}`);
    }
  }

  /**
   * Creates fragment groups for discrete structural entities within the polymer graphs
   * @TODO replace dummy molecular weight with simple estimation of mw for vaild SMILES
   * @param nodeGroup string[]
   * @param rowNumber number
   * @returns string
   */
  private createFragment(nodeGroup: string[], rowNumber: number) {
    const smiles = nodeGroup[1];

    const connectionPointQ = new RegExp(/\[Q\]/g);
    let pointQ = connectionPointQ.test(smiles)
      ? `\n\tpoint Q {\n\t\tquantity: 1;\n\t};\n`
      : "";

    const connectionPointR = new RegExp(/\[R\]/g);
    let pointR = connectionPointR.test(smiles)
      ? `\n\tpoint R {\n\t\tquantity: 1;\n\t};\n`
      : "";

    const connectionPointX = new RegExp(/\[X\]/g);
    let pointX = connectionPointX.test(smiles)
      ? `\n\tpoint X {\n\t\tquantity: 1;\n\t};\n`
      : "";

    const connectionPointZ = new RegExp(/\[Z\]/g);
    let pointZ = connectionPointZ.test(smiles)
      ? `\n\tpoint Z {\n\t\tquantity: 1;\n\t};\n`
      : "";

    const fragmentName = this.stripBrackets(nodeGroup[0]);
    const header = `fragment ${fragmentName}_${rowNumber} {\n`;
    const fakeMw = `\tmolecular_weight: 123 g/mol;\n`;
    const smilesProp = `\tsmiles: "${smiles}";\n`;

    const footer = `\n}`;

    return `${header}${fakeMw}${smilesProp}${pointQ}${pointR}${pointX}${pointZ}${footer}`;
  }

  /**
   * Creates connection strings for a container or polymer_graph element
   * @param connectionTuple string[]
   * @param rowNumber number
   * @returns string
   */
  private createConnection(connectionTuple: string[], rowNumber: number) {
    const sourcePoint = this.stripBrackets(connectionTuple[0]).split(".");
    const targetPoint = this.stripBrackets(connectionTuple[1]).split(".");

    sourcePoint[0] = `${sourcePoint[0]}_${rowNumber}`;
    targetPoint[0] = `${targetPoint[0]}_${rowNumber}`;

    return `<@${sourcePoint.join(".")} => @${targetPoint.join(".")}>;\n`;
  }

  /**
   * Helper method to strip brackets from a generated polymer string
   * @param groupName string
   * @returns string
   */
  private stripBrackets(groupName: string) {
    const bracketRegex = new RegExp(/\[|\]/g);
    return groupName.replaceAll(bracketRegex, "");
  }
}
