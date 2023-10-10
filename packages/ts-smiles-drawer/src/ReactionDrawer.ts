import { SvgDrawer } from "./SvgDrawer";
import { SvgWrapper } from "./SvgWrapper";
import { Options } from "./Options";
import { ThemeManager } from "./ThemeManager";
import { formulaToCommonName } from "./FormulaToCommonName";

export class ReactionDrawer {
  defaultOptions: any;
  opts: any;
  drawer: SvgDrawer;
  molOpts: any;
  themeManager: any;

  /**
   * The constructor for the class ReactionDrawer.
   *
   * @param {Object} options An object containing reaction drawing specitic options.
   * @param {Object} moleculeOptions An object containing molecule drawing specific options.
   */
  constructor(options: any, moleculeOptions: any) {
    this.defaultOptions = {
      scale: moleculeOptions.scale > 0.0 ? moleculeOptions.scale : 1.0,
      fontSize: moleculeOptions.fontSizeLarge * 0.8,
      fontFamily: "Arial, Helvetica, sans-serif",
      spacing: 10,
      plus: {
        size: 9,
        thickness: 1.0,
      },
      arrow: {
        length: moleculeOptions.bondLength * 4.0,
        headSize: 6.0,
        thickness: 1.0,
        margin: 3,
      },
    };

    //@ts-ignore
    this.opts = Options.extend(true, this.defaultOptions, options);

    this.drawer = new SvgDrawer(moleculeOptions);
    this.molOpts = this.drawer.opts;
  }

  /**
   * Draws the parsed reaction smiles data to a canvas element.
   *
   * @param {Object} reaction The reaction object returned by the reaction smiles parser.
   * @param {(String|SVGElement)} target The id of the HTML canvas element the structure is drawn to - or the element itself.
   * @param {String} themeName='dark' The name of the theme to use. Built-in themes are 'light' and 'dark'.
   * @param {Boolean} infoOnly=false Only output info on the molecule without drawing anything to the canvas.
   *
   * @returns {SVGElement} The svg element
   */
  draw(
    reaction: any,
    target: any,
    themeName = "light",
    textAbove = "{reagents}",
    textBelow = "",
    infoOnly = false
  ) {
    this.themeManager = new ThemeManager(this.molOpts.themes, themeName);
    let svg: any = null;

    if (target === null || target === "svg") {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttributeNS(null, "width", 500 + "");
      svg.setAttributeNS(null, "height", 500 + "");
    } else if (typeof target === "string") {
      svg = document.getElementById(target);
    } else {
      svg = target;
    }

    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const elements = [];

    let maxHeight = 0.0;

    // Reactants
    for (let i = 0; i < reaction.reactants.length; i++) {
      if (i > 0) {
        elements.push({
          width: this.opts.plus.size * this.opts.scale,
          height: this.opts.plus.size * this.opts.scale,
          svg: this.getPlus(),
        });
      }

      const reactantSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

      this.drawer.draw(reaction.reactants[i], reactantSvg, themeName, infoOnly);

      const element = {
        width: reactantSvg.viewBox.baseVal.width * this.opts.scale,
        height: reactantSvg.viewBox.baseVal.height * this.opts.scale,
        svg: reactantSvg,
      };

      elements.push(element);

      if (element.height > maxHeight) {
        maxHeight = element.height;
      }
    }

    // Arrow
    elements.push({
      width: this.opts.arrow.length * this.opts.scale,
      height: this.opts.arrow.headSize * 2.0 * this.opts.scale,
      svg: this.getArrow(),
    });

    // Text above the arrow / reagents
    let reagentsText = "";
    for (let i = 0; i < reaction.reagents.length; i++) {
      if (i > 0) {
        reagentsText += ", ";
      }

      let text = this.drawer.getMolecularFormula(reaction.reagents[i]);
      if (text in formulaToCommonName) {
        text = (formulaToCommonName as Record<string, any>)[text];
      }

      reagentsText += SvgWrapper.replaceNumbersWithSubscript(text);
    }

    textAbove = textAbove.replace("{reagents}", reagentsText);

    const topText = SvgWrapper.writeText(
      textAbove,
      this.themeManager,
      this.opts.fontSize * this.opts.scale,
      this.opts.fontFamily,
      this.opts.arrow.length * this.opts.scale
    );

    let centerOffsetX =
      (this.opts.arrow.length * this.opts.scale - topText.width) / 2.0;

    elements.push({
      svg: topText.svg,
      height: topText.height,
      width: this.opts.arrow.length * this.opts.scale,
      offsetX:
        -(this.opts.arrow.length * this.opts.scale + this.opts.spacing) +
        centerOffsetX,
      offsetY: -(topText.height / 2.0) - this.opts.arrow.margin,
      position: "relative",
    });

    // Text below arrow
    const bottomText = SvgWrapper.writeText(
      textBelow,
      this.themeManager,
      this.opts.fontSize * this.opts.scale,
      this.opts.fontFamily,
      this.opts.arrow.length * this.opts.scale
    );

    centerOffsetX =
      (this.opts.arrow.length * this.opts.scale - bottomText.width) / 2.0;

    elements.push({
      svg: bottomText.svg,
      height: bottomText.height,
      width: this.opts.arrow.length * this.opts.scale,
      offsetX:
        -(this.opts.arrow.length * this.opts.scale + this.opts.spacing) +
        centerOffsetX,
      offsetY: bottomText.height / 2.0 + this.opts.arrow.margin,
      position: "relative",
    });

    // Products
    for (let i = 0; i < reaction.products.length; i++) {
      if (i > 0) {
        elements.push({
          width: this.opts.plus.size,
          height: this.opts.plus.size,
          svg: this.getPlus(),
        });
      }

      const productSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

      this.drawer.draw(reaction.products[i], productSvg, themeName, infoOnly);

      const element = {
        width: productSvg.viewBox.baseVal.width * this.opts.scale,
        height: productSvg.viewBox.baseVal.height * this.opts.scale,
        svg: productSvg,
      };

      elements.push(element);

      if (element.height > maxHeight) {
        maxHeight = element.height;
      }
    }

    let totalWidth = 0.0;

    elements.forEach((element: any) => {
      const offsetX = element.offsetX ?? 0.0;
      const offsetY = element.offsetY ?? 0.0;

      element.svg.setAttributeNS(null, "x", Math.round(totalWidth + offsetX));
      element.svg.setAttributeNS(
        null,
        "y",
        Math.round((maxHeight - element.height) / 2.0 + offsetY)
      );
      element.svg.setAttributeNS(null, "width", Math.round(element.width));
      element.svg.setAttributeNS(null, "height", Math.round(element.height));
      svg.appendChild(element.svg);

      if (element.position !== "relative") {
        totalWidth += Math.round(element.width + this.opts.spacing + offsetX);
      }
    });

    svg.setAttributeNS(null, "viewBox", `0 0 ${totalWidth} ${maxHeight}`);
    svg.style.width = totalWidth + "px";
    svg.style.height = maxHeight + "px";

    return svg;
  }

  getPlus() {
    const s = this.opts.plus.size;
    const w = this.opts.plus.thickness;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const rect_h = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    const rect_v = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );

    svg.setAttributeNS(null, "id", "plus");

    rect_h.setAttributeNS(null, "x", String(0));
    rect_h.setAttributeNS(null, "y", String(s / 2.0 - w / 2.0));
    rect_h.setAttributeNS(null, "width", s);
    rect_h.setAttributeNS(null, "height", w);
    rect_h.setAttributeNS(null, "fill", this.themeManager.getColor("C"));

    rect_v.setAttributeNS(null, "x", String(s / 2.0 - w / 2.0));
    rect_v.setAttributeNS(null, "y", String(0));
    rect_v.setAttributeNS(null, "width", w);
    rect_v.setAttributeNS(null, "height", s);
    rect_v.setAttributeNS(null, "fill", this.themeManager.getColor("C"));

    svg.appendChild(rect_h);
    svg.appendChild(rect_v);
    svg.setAttributeNS(null, "viewBox", `0 0 ${s} ${s}`);

    return svg;
  }

  getArrowhead() {
    const s = this.opts.arrow.headSize;
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );

    marker.setAttributeNS(null, "id", "arrowhead");
    marker.setAttributeNS(null, "viewBox", `0 0 ${s} ${s}`);
    marker.setAttributeNS(null, "markerUnits", "userSpaceOnUse");
    marker.setAttributeNS(null, "markerWidth", s);
    marker.setAttributeNS(null, "markerHeight", s);
    marker.setAttributeNS(null, "refX", String(0));
    marker.setAttributeNS(null, "refY", String(s / 2));
    marker.setAttributeNS(null, "orient", "auto");
    marker.setAttributeNS(null, "fill", this.themeManager.getColor("C"));

    polygon.setAttributeNS(null, "points", `0 0, ${s} ${s / 2}, 0 ${s}`);

    marker.appendChild(polygon);

    return marker;
  }

  getCDArrowhead() {
    const s = this.opts.arrow.headSize;
    const sw = s * (7 / 4.5);
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    marker.setAttributeNS(null, "id", "arrowhead");
    marker.setAttributeNS(null, "viewBox", `0 0 ${sw} ${s}`);
    marker.setAttributeNS(null, "markerUnits", "userSpaceOnUse");
    marker.setAttributeNS(null, "markerWidth", String(sw * 2));
    marker.setAttributeNS(null, "markerHeight", String(s * 2));
    marker.setAttributeNS(null, "refX", String(2.2));
    marker.setAttributeNS(null, "refY", String(2.2));
    marker.setAttributeNS(null, "orient", "auto");
    marker.setAttributeNS(null, "fill", this.themeManager.getColor("C"));

    path.setAttributeNS(null, "style", "fill-rule:nonzero;");
    path.setAttributeNS(
      null,
      "d",
      "m 0 0 l 7 2.25 l -7 2.25 c 0 0 0.735 -1.084 0.735 -2.28 c 0 -1.196 -0.735 -2.22 -0.735 -2.22 z"
    );

    marker.appendChild(path);

    return marker;
  }

  getArrow() {
    const s = this.opts.arrow.headSize;
    const l = this.opts.arrow.length;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    defs.appendChild(this.getCDArrowhead());
    svg.appendChild(defs);

    svg.setAttributeNS(null, "id", "arrow");

    line.setAttributeNS(null, "x1", String(0.0));
    line.setAttributeNS(null, "y1", String(-this.opts.arrow.thickness / 2.0));
    line.setAttributeNS(null, "x2", l);
    line.setAttributeNS(null, "y2", String(-this.opts.arrow.thickness / 2.0));
    line.setAttributeNS(null, "stroke-width", this.opts.arrow.thickness);
    line.setAttributeNS(null, "stroke", this.themeManager.getColor("C"));
    line.setAttributeNS(null, "marker-end", "url(#arrowhead)");

    svg.appendChild(line);
    svg.setAttributeNS(
      null,
      "viewBox",
      `0 ${-s / 2.0} ${l + s * (7 / 4.5)} ${s}`
    );

    return svg;
  }
}
