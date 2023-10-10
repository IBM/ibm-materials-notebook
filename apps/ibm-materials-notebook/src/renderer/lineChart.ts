import {
  scaleLinear,
  min,
  max,
  axisLeft,
  axisBottom,
  line,
  ScaleLinear,
} from "d3";
import BaseChart from "./baseChart";

const chartConfig = {
  width: 800,
  height: 400,
  margin: {
    top: 40,
    right: 50,
    bottom: 60,
    left: 50,
  },
};

export default class LineChart extends BaseChart {
  private data: number[][];
  private xMin: number | undefined;
  private xMax: number | undefined;
  private yMin: number | undefined;
  private yMax: number | undefined;
  private xScale: ScaleLinear<number, number>;
  private yScale: ScaleLinear<number, number>;

  constructor(id: string) {
    super(id, chartConfig);
    this.data = [];
    this.xScale = scaleLinear().domain([0, 1]).range([0, this.svgWidth]);
    this.yScale = scaleLinear().domain([0, 1]).range([this.svgHeight, 0]);
  }

  set values(lineData: string[][]) {
    this.data = lineData.map((item) => {
      const updatedItem = [Number(item[0]), Number(item[1])];
      return updatedItem;
    });
  }

  private initializeChart() {
    this.xMin = min(this.data, (d) => d[0]);
    this.xMax = max(this.data, (d) => d[0]);
    const maxValue = this.xMax ? this.xMax : 100;
    const minValue = this.xMin ? this.xMin : 0;

    this.xScale = scaleLinear()
      .domain([minValue, maxValue])
      .range([0, this.width]);

    this.yMin = min(this.data, (d) => d[1]);
    this.yMax = max(this.data, (d) => d[1]);
    const ymaxValue = this.yMax ? this.yMax : 100;
    this.yScale = scaleLinear().domain([0, ymaxValue]).range([this.height, 0]);
  }

  private appendScales() {
    this.svg
      .append("g")
      .attr("transform", `translate(0, ${this.height})`)
      .call(axisBottom(this.xScale));

    this.svg.append("g").call(axisLeft(this.yScale));

    this.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", this.width / 2 + this.marginLeft)
      .attr("y", this.height + this.marginTop - 10)
      .attr("fill", "white")
      .text("Residence Time (min)");

    this.svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -this.marginLeft + 15)
      .attr("x", -this.marginTop - this.height / 2 + 70)
      .attr("fill", "white")
      .text("Response");
  }

  private drawLine() {
    this.svg
      .append("path")
      .datum(this.data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        line()
          .x((d) => this.xScale(d[0]))
          .y((d) => this.yScale(d[1]))
      );
  }

  public plot() {
    this.clearChart();
    this.initializeSvg();
    this.initializeChart();
    this.appendScales();
    this.drawLine();
  }
}
