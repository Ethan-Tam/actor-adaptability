class stackedBarChart {
  constructor(_config) {
	// Set up configuration of visualization
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 700,
      margin: _config.margin || { top: 10, bottom: 60, right: 20, left: 100 }
    }
  }

  initVis() {
    let vis = this;

    // Compute the size of the visualization for later use
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // TODO Create the x-scale and axis

    // Create the chart and set initial configuration
    vis.chart = d3.select(vis.config.parentElement).append("g")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // TODO: add x axis labels
  }

  update(selected) {
    let vis = this;

    // Store the current state
    vis.selectedEntity = selected;

    vis.render();
  }

  render() {
    let vis = this;

    // TODO: y-axis, scale, 
  }
}
