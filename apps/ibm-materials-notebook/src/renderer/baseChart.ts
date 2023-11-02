import { select, Selection } from "d3";

interface SVGMargin {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface ChartConfig {
  width: number;
  height: number;
  margin: SVGMargin;
}

export default abstract class BaseChart {
  _id: string;
  svg: Selection<SVGGElement, unknown, HTMLElement, any>;
  _width: number;
  _height: number;
  _margin: SVGMargin;

  constructor(id: string, { width, height, margin }: ChartConfig) {
    this._width = width;
    this._height = height;
    this._margin = margin;
    this._id = id;
    this.svg = select(this.id)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight)
      .append("g")
      .attr("transform", `translate(${this.marginLeft}, ${this.marginTop})`);
  }

  get id() {
    return `#${this._id}`;
  }

  get svgWidth() {
    return this._width;
  }

  get svgHeight() {
    return this._height;
  }

  get width() {
    return this._width - this._margin.left - this._margin.right;
  }

  get height() {
    return this._height - this._margin.top - this._margin.bottom;
  }

  get marginLeft() {
    return this._margin.left;
  }

  get marginTop() {
    return this._margin.top;
  }

  get marginRight() {
    return this._margin.right;
  }

  clearChart() {
    select(this.id).selectAll("svg").remove();
    select(this.id).selectAll("div").remove();
  }

  initializeSvg() {
    this.svg = select(this.id)
      .append("svg")
      .attr("width", this.svgWidth)
      .attr("height", this.svgHeight)
      .append("g")
      .attr("transform", `translate(${this.marginLeft}, ${this.marginTop})`);
  }

  // initializeSvgViewBox() {
  //   this.svg = select(this.id)
  //     .append("svg")
  //     .attr("viewBox", `0 0 ${this.svgWidth}, ${this.svgHeight}`)
  //     .attr("style", "max-width: 100%; height: auto;");
  // }
}
