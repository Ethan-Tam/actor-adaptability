class BarChart {
  constructor(_config) {
    // I made this class to be pretty abstract, so there are a lot of things to
    // configure
    this.data = _config.data;
    this.xAxisLabel = _config.xAxisLabel;
    this.yAxisLabel = _config.yAxisLabel;
    this.xSelector = _config.xSelector;
    this.ySelector = _config.ySelector;
    this.hovered = _config.hovered;
    this.selected = _config.selected;
    this.yRange = _config.yRange;
    this.mouseover = _config.mouseover;
    this.mouseout = _config.mouseout;
    this.click = _config.click;
    this.name = _config.name;

    // Set up initial configuration
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 600,
      containerHeight: 500,
      margin: _config.margin || { top: 10, bottom: 60, right: 20, left: 100 }
    }

    this.initVis();
  }

  initVis() {
    let vis = this;

    // Compute size for later use
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Initialize y scale and axis
    vis.yScale = d3.scaleLinear()
        .domain([0, vis.yRange.max])
        .range([vis.height, 0])
        .nice();

    vis.yAxis = d3.axisLeft(vis.yScale);

    // Create the chart
    vis.chart = d3.select(vis.config.parentElement).append("g")
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Add y axis labels to chart
    vis.yAxisG = vis.chart.append("g").call(vis.yAxis);
    vis.yAxisG.append("text")
        .attr("class", "axis-label")
        .attr("y", -80)
        .attr("x", -vis.height / 2)
        .attr("transform", `rotate(-90)`)
        .attr("text-anchor", "middle")
        .text(vis.yAxisLabel);
  }

  update(xSelector, ySelector, hovered, selected, filter) {
    let vis = this;

    // Set up configuration
    vis.xSelector = xSelector;
    vis.ySelector = ySelector;
    vis.hovered = hovered;
    vis.selected = selected;
    vis.filter = filter;

    vis.render();
  }

  render() {
    let vis = this;

    // Filter the data
    const data = vis.filter(vis.data);

    // Set up the x scale and axis
    vis.xScale = d3.scaleBand()
        .domain(data.map(vis.xSelector))
        .range([0, vis.width]);

    vis.xAxis = d3.axisBottom(vis.xScale);

    // Remove old axes
    vis.chart.selectAll(".x-axis-label").remove();

    // Add axis labels
    vis.xAxisG = vis.chart.append("g").call(vis.xAxis)
        .attr("transform", `translate(0,${vis.height})`)
        .attr("class", "x-axis-label");
    vis.xAxisG.append("text")
        .attr("class", "x-axis-label")
        .attr("y", 50)
        .attr("x", vis.width / 2)
        .text(vis.xAxisLabel);

    // Draw the bars
    vis.chart.selectAll("rect")
        .data(data)
      .join("rect")
        .attr('width', vis.xScale.bandwidth() - 30)
        .attr("fill", d => {
          // Set colour based on state
          if (vis.hovered === vis.name(d))
            return "#71361c";
          else if (vis.selected === vis.name(d))
            return "#b35227";
          else
            return "#4682b4";
        })
        .on("mouseover", vis.mouseover)
        .on("mouseout", vis.mouseout)
        .on("click", vis.click)
      .transition(1000)
        // Set the position and radius in a transition so it is smooth
        .attr('x', d => vis.xScale(vis.xSelector(d)) + 15)
        .attr('y', d => vis.yScale(vis.ySelector(d)))
        .attr('height', d => vis.height - vis.yScale(vis.ySelector(d)));
    }
}
