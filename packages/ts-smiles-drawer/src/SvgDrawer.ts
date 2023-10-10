// we use the drawer to do all the preprocessing. then we take over the drawing
// portion to output to svg
import { ArrayHelper } from "./ArrayHelper";
import { Atom } from "./Atom";
import { DrawerBase } from "./DrawerBase";
import { Graph } from "./Graph";
import { Line } from "./Line";
import { SvgWrapper } from "./SvgWrapper";
import { ThemeManager } from "./ThemeManager";
import { Vector2 } from "./Vector2";
import { Ring } from "./Ring";

export class SvgDrawer {
  preprocessor: DrawerBase;
  opts: any;
  clear: boolean;
  svgWrapper: any;
  themeManager: any;
  svgDrawer: any;
  bridgedRing: any;

  constructor(options: any, clear = true) {
    this.preprocessor = new DrawerBase(options);
    this.opts = this.preprocessor.opts;
    this.clear = clear;
    this.svgWrapper = null;
  }

  /**
   * Draws the parsed smiles data to an svg element.
   *
   * @param {Object} data The tree returned by the smiles parser.
   * @param {(String|SVGElement)} target The id of the HTML svg element the structure is drawn to - or the element itself.
   * @param {String} themeName='dark' The name of the theme to use. Built-in themes are 'light' and 'dark'.
   * @param {Boolean} infoOnly=false Only output info on the molecule without drawing anything to the canvas.
   *
   * @returns {SVGElement} The svg element
   */
  draw(
    data: any,
    target: any,
    themeName = "light",
    infoOnly = false,
    highlight_atoms: any[] = []
  ) {
    try {
      if (target === null || target === "svg") {
        target = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        target.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        target.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        target.setAttributeNS(null, "width", this.opts.width);
        target.setAttributeNS(null, "height", this.opts.height);
      } else if (typeof target === "string") {
        target = document.getElementById(target);
      }

      const preprocessor = this.preprocessor;

      preprocessor.initDraw(data, themeName, infoOnly, highlight_atoms);

      if (!infoOnly) {
        this.themeManager = new ThemeManager(this.opts.themes, themeName);
        if (this.svgWrapper === null || this.clear) {
          this.svgWrapper = new SvgWrapper(
            this.themeManager,
            target,
            this.opts,
            this.clear
          );
        }
      }

      preprocessor.processGraph();

      // Set the canvas to the appropriate size
      this.svgWrapper.determineDimensions(preprocessor.graph.vertices);

      // Do the actual drawing
      this.drawAtomHighlights(preprocessor.opts.debug);
      this.drawEdges(preprocessor.opts.debug);
      this.drawVertices(preprocessor.opts.debug);

      if (preprocessor.opts.debug) {
        console.log(preprocessor.graph);
        console.log(preprocessor.rings);
        console.log(preprocessor.ringConnections);
      }

      this.svgWrapper.constructSvg();
      return target;
    } catch (error) {
      throw new Error(`Error during drawing smiles:\n${error} `);
    }
  }

  /**
   * Draws the parsed smiles data to a canvas element.
   *
   * @param {Object} data The tree returned by the smiles parser.
   * @param {(String|HTMLCanvasElement)} target The id of the HTML canvas element the structure is drawn to - or the element itself.
   * @param {String} themeName='dark' The name of the theme to use. Built-in themes are 'light' and 'dark'.
   * @param {Boolean} infoOnly=false Only output info on the molecule without drawing anything to the canvas.
   */
  drawCanvas(data: any, target: any, themeName = "light", infoOnly = false) {
    let canvas = null;
    if (typeof target === "string") {
      canvas = document.getElementById(target);
    } else {
      canvas = target;
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // 500 as a size is arbritrary, but the canvas is scaled when drawn to the canvas anyway
    svg.setAttributeNS(null, "viewBox", "0 0 " + 500 + " " + 500);
    svg.setAttributeNS(null, "width", 500 + "");
    svg.setAttributeNS(null, "height", 500 + "");
    svg.setAttributeNS(
      null,
      "style",
      "visibility: hidden: position: absolute; left: -1000px"
    );
    document.body.appendChild(svg);
    this.svgDrawer.draw(data, svg, themeName, infoOnly);
    this.svgDrawer.svgWrapper.toCanvas(
      canvas,
      this.svgDrawer.opts.width,
      this.svgDrawer.opts.height
    );
    document.body.removeChild(svg);
    return target;
  }

  /**
   * Draws a ring inside a provided ring, indicating aromaticity.
   *
   * @param {Ring} ring A ring.
   */
  drawAromaticityRing(ring: Ring) {
    const svgWrapper = this.svgWrapper;
    svgWrapper.drawRing(ring.center.x, ring.center.y, ring.getSize());
  }

  /**
   * Draw the actual edges as bonds.
   *
   * @param {Boolean} debug A boolean indicating whether or not to draw debug helpers.
   */
  drawEdges(debug: boolean) {
    const preprocessor = this.preprocessor,
      graph = preprocessor.graph,
      rings = preprocessor.rings,
      drawn = Array(this.preprocessor.graph.edges.length);

    drawn.fill(false);

    graph.traverseBF(0, (vertex: any) => {
      const edges = graph.getEdges(vertex.id);
      for (let i = 0; i < edges.length; i++) {
        const edgeId = edges[i];
        if (!drawn[edgeId]) {
          drawn[edgeId] = true;
          this.drawEdge(edgeId, debug);
        }
      }
    });

    // Draw ring for implicitly defined aromatic rings
    if (!this.bridgedRing) {
      for (let i = 0; i < rings.length; i++) {
        const ring = rings[i];

        //TODO: uses canvas ctx to draw... need to update this to SVG
        if (preprocessor.isRingAromatic(ring)) {
          this.drawAromaticityRing(ring);
        }
      }
    }
  }

  /**
   * Draw the an edge as a bond.
   *
   * @param {Number} edgeId An edge id.
   * @param {Boolean} debug A boolean indicating whether or not to draw debug helpers.
   */
  drawEdge(edgeId: number, debug: boolean) {
    const preprocessor = this.preprocessor,
      opts = preprocessor.opts,
      svgWrapper = this.svgWrapper,
      edge = preprocessor.graph.edges[edgeId],
      vertexA = preprocessor.graph.vertices[edge.sourceId],
      vertexB = preprocessor.graph.vertices[edge.targetId],
      elementA = vertexA.value.element,
      elementB = vertexB.value.element;

    if (
      (!vertexA.value.isDrawn || !vertexB.value.isDrawn) &&
      preprocessor.opts.atomVisualization === "default"
    ) {
      return;
    }

    const a = vertexA.position,
      b = vertexB.position,
      normals = preprocessor.getEdgeNormals(edge),
      // Create a point on each side of the line
      sides = ArrayHelper.clone(normals);

    sides[0].multiplyScalar(10).add(a);
    sides[1].multiplyScalar(10).add(a);

    if (
      edge.bondType === "=" ||
      preprocessor.getRingbondType(vertexA, vertexB) === "=" ||
      (edge.isPartOfAromaticRing && preprocessor.bridgedRing)
    ) {
      // Always draw double bonds inside the ring
      const inRing = preprocessor.areVerticesInSameRing(vertexA, vertexB);
      const s = preprocessor.chooseSide(vertexA, vertexB, sides);

      if (inRing) {
        // Always draw double bonds inside a ring
        // if the bond is shared by two rings, it is drawn in the larger
        // problem: smaller ring is aromatic, bond is still drawn in larger -> fix this
        const lcr = preprocessor.getLargestOrAromaticCommonRing(
          vertexA,
          vertexB
        );
        const center = lcr.center;

        normals[0].multiplyScalar(opts.bondSpacing);
        normals[1].multiplyScalar(opts.bondSpacing);

        // Choose the normal that is on the same side as the center
        let line = null;

        if (
          center.sameSideAs(
            vertexA.position,
            vertexB.position,
            Vector2.add(a, normals[0])
          )
        ) {
          line = new Line(
            Vector2.add(a, normals[0]),
            Vector2.add(b, normals[0]),
            elementA,
            elementB
          );
        } else {
          line = new Line(
            Vector2.add(a, normals[1]),
            Vector2.add(b, normals[1]),
            elementA,
            elementB
          );
        }

        line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);

        // The shortened edge
        if (edge.isPartOfAromaticRing) {
          // preprocessor.canvasWrapper.drawLine(line, true);
          svgWrapper.drawLine(line, true);
        } else {
          // preprocessor.canvasWrapper.drawLine(line);
          svgWrapper.drawLine(line);
        }

        svgWrapper.drawLine(new Line(a, b, elementA, elementB));
      } else if (
        edge.center ||
        (vertexA.isTerminal() && vertexB.isTerminal()) ||
        (s.anCount === 0 && s.bnCount > 1) ||
        (s.bnCount === 0 && s.anCount > 1)
      ) {
        this.multiplyNormals(normals, opts.halfBondSpacing);

        const lineA = new Line(
            Vector2.add(a, normals[0]),
            Vector2.add(b, normals[0]),
            elementA,
            elementB
          ),
          lineB = new Line(
            Vector2.add(a, normals[1]),
            Vector2.add(b, normals[1]),
            elementA,
            elementB
          );

        svgWrapper.drawLine(lineA);
        svgWrapper.drawLine(lineB);
      } else if (
        s.sideCount[0] > s.sideCount[1] ||
        s.totalSideCount[0] > s.totalSideCount[1]
      ) {
        this.multiplyNormals(normals, opts.bondSpacing);

        const line = new Line(
          Vector2.add(a, normals[0]),
          Vector2.add(b, normals[0]),
          elementA,
          elementB
        );

        line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);

        svgWrapper.drawLine(line);
        svgWrapper.drawLine(new Line(a, b, elementA, elementB));
      } else if (
        s.sideCount[0] < s.sideCount[1] ||
        s.totalSideCount[0] <= s.totalSideCount[1]
      ) {
        this.multiplyNormals(normals, opts.bondSpacing);

        const line = new Line(
          Vector2.add(a, normals[1]),
          Vector2.add(b, normals[1]),
          elementA,
          elementB
        );

        line.shorten(opts.bondLength - opts.shortBondLength * opts.bondLength);
        svgWrapper.drawLine(line);
        svgWrapper.drawLine(new Line(a, b, elementA, elementB));
      }
    } else if (edge.bondType === "#") {
      normals[0].multiplyScalar(opts.bondSpacing / 1.5);
      normals[1].multiplyScalar(opts.bondSpacing / 1.5);

      const lineA = new Line(
        Vector2.add(a, normals[0]),
        Vector2.add(b, normals[0]),
        elementA,
        elementB
      );
      const lineB = new Line(
        Vector2.add(a, normals[1]),
        Vector2.add(b, normals[1]),
        elementA,
        elementB
      );

      svgWrapper.drawLine(lineA);
      svgWrapper.drawLine(lineB);
      svgWrapper.drawLine(new Line(a, b, elementA, elementB));
    } else if (edge.bondType === ".") {
      // TODO: Something... maybe... version 2?
    } else {
      const isChiralCenterA = vertexA.value.isStereoCenter;
      const isChiralCenterB = vertexB.value.isStereoCenter;

      if (edge.wedge === "up") {
        svgWrapper.drawWedge(
          new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB)
        );
      } else if (edge.wedge === "down") {
        svgWrapper.drawDashedWedge(
          new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB)
        );
      } else {
        svgWrapper.drawLine(
          new Line(a, b, elementA, elementB, isChiralCenterA, isChiralCenterB)
        );
      }
    }

    if (debug) {
      const midpoint = Vector2.midpoint(a, b);
      svgWrapper.drawDebugText(midpoint.x, midpoint.y, "e: " + edgeId);
    }
  }

  /**
   * Draw the highlights for atoms to the canvas.
   *
   * @param {Boolean} debug
   */
  drawAtomHighlights(debug: boolean) {
    const preprocessor = this.preprocessor;
    const opts = preprocessor.opts;
    const graph = preprocessor.graph;
    const rings = preprocessor.rings;
    const svgWrapper = this.svgWrapper;

    for (let i = 0; i < graph.vertices.length; i++) {
      const vertex = graph.vertices[i];
      const atom = vertex.value;

      for (let j = 0; j < preprocessor.highlight_atoms.length; j++) {
        const highlight = preprocessor.highlight_atoms[j];
        if (atom.class === highlight[0]) {
          svgWrapper.drawAtomHighlight(
            vertex.position.x,
            vertex.position.y,
            highlight[1]
          );
        }
      }
    }
  }

  /**
   * Draws the vertices representing atoms to the canvas.
   *
   * @param {Boolean} debug A boolean indicating whether or not to draw debug messages to the canvas.
   */
  drawVertices(debug: boolean) {
    const preprocessor = this.preprocessor,
      opts = preprocessor.opts,
      graph = preprocessor.graph,
      rings = preprocessor.rings,
      svgWrapper = this.svgWrapper;

    let i = graph.vertices.length;
    for (let i: any = 0; i < graph.vertices.length; i++) {
      const vertex = graph.vertices[i];
      const atom = vertex.value;
      let charge = 0;
      let isotope = 0;
      const bondCount = vertex.value.bondCount;
      const element = atom.element;
      let hydrogens = Atom.maxBonds[element] - bondCount;
      let dir = vertex.getTextDirection(graph.vertices);
      const isTerminal =
        opts.terminalCarbons ||
        element !== "C" ||
        atom.hasAttachedPseudoElements
          ? vertex.isTerminal()
          : false;
      const isCarbon = atom.element === "C";

      // This is a HACK to remove all hydrogens from nitrogens in aromatic rings, as this
      // should be the most common state. This has to be fixed by kekulization
      if (atom.element === "N" && atom.isPartOfAromaticRing) {
        hydrogens = 0;
      }

      if (atom.bracket) {
        hydrogens = atom.bracket.hcount;
        charge = atom.bracket.charge;
        isotope = atom.bracket.isotope;
      }

      if (opts.atomVisualization === "allballs") {
        svgWrapper.drawBall(vertex.position.x, vertex.position.y, element);
      } else if (
        (atom.isDrawn &&
          (!isCarbon ||
            atom.drawExplicit ||
            isTerminal ||
            atom.hasAttachedPseudoElements)) ||
        graph.vertices.length === 1
      ) {
        if (opts.atomVisualization === "default") {
          const attachedPseudoElements = atom.getAttachedPseudoElements();

          // Draw to the right if the whole molecule is concatenated into one string
          if (
            atom.hasAttachedPseudoElements &&
            graph.vertices.length ===
              Object.keys(attachedPseudoElements).length + 1
          ) {
            dir = "right";
          }

          svgWrapper.drawText(
            vertex.position.x,
            vertex.position.y,
            element,
            hydrogens,
            dir,
            isTerminal,
            charge,
            isotope,
            graph.vertices.length,
            attachedPseudoElements
          );
        } else if (opts.atomVisualization === "balls") {
          svgWrapper.drawBall(vertex.position.x, vertex.position.y, element);
        }
      } else if (
        vertex.getNeighbourCount() === 2 &&
        vertex.forcePositioned === true
      ) {
        // If there is a carbon which bonds are in a straight line, draw a dot
        const a = graph.vertices[vertex.neighbours[0]].position;
        const b = graph.vertices[vertex.neighbours[1]].position;
        const angle = Vector2.threePointangle(vertex.position, a, b);

        if (Math.abs(Math.PI - angle) < 0.1) {
          svgWrapper.drawPoint(vertex.position.x, vertex.position.y, element);
        }
      }

      if (debug) {
        const value =
          "v: " + vertex.id + " " + ArrayHelper.print(atom.ringbonds);
        svgWrapper.drawDebugText(vertex.position.x, vertex.position.y, value);
      }
      // else {
      //   svgWrapper.drawDebugText(vertex.position.x, vertex.position.y, vertex.value.chirality);
      // }
    }

    // Draw the ring centers for debug purposes
    if (opts.debug) {
      for (let i: any = 0; i < rings.length; i++) {
        const center = rings[i].center;
        svgWrapper.drawDebugPoint(center.x, center.y, "r: " + rings[i].id);
      }
    }
  }

  /**
   * Returns the total overlap score of the current molecule.
   *
   * @returns {Number} The overlap score.
   */
  getTotalOverlapScore() {
    return this.preprocessor.getTotalOverlapScore();
  }

  /**
   * Returns the molecular formula of the loaded molecule as a string.
   *
   * @returns {String} The molecular formula.
   */
  getMolecularFormula(graph = null) {
    return this.preprocessor.getMolecularFormula(graph);
  }

  /**
   * @param {Array} normals list of normals to multiply
   * @param {Number} spacing value to multiply normals by
   */
  multiplyNormals(normals: any[], spacing: number) {
    normals[0].multiplyScalar(spacing);
    normals[1].multiplyScalar(spacing);
  }
}
