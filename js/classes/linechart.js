class multiLineChart {
  constructor(_config) {
    // Set up configuration of visualization
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 30, bottom: 80, right: 20, left: 30 }
    }
  }

  initVis() {
    let vis = this;

    // Compute the size of the visualization for later use
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Create the chart and set initial configuration
    vis.chart = d3.select(vis.config.parentElement).append("g")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Compute x-scale
    vis.xScale = d3.scaleLinear()
      .domain([2006, 2016])
      .range([0, vis.width]);

    // Set vis.xAxis
    vis.xAxis = d3.axisBottom(vis.xScale)
      .tickFormat(d3.format('d'));

    // Add x-axis
    vis.xAxisG = vis.chart.append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0,${vis.height})`)
      .call(vis.xAxis);

    // Add y-axis
    vis.yAxisG = vis.chart.append("g")
      .attr("id", "yAxis");

    // Add chart title
    vis.title = d3.select(vis.config.parentElement).append('text')
      .attr("x", vis.config.margin.left + (vis.width / 2))
      .attr("y", vis.config.margin.top - 10)
      .attr("text-anchor", "middle")
      .text("Movies counts per year and their genres");

    vis.update();
  }

  update() {
    let vis = this;
    let selectedData;

    if (vis.selectedActor === null && vis.selectedGenre === null) {
      // Nothing is selected
      selectedData = vis.data["all"]
    } else if (vis.selectedActor!== null && vis.selectedGenre === null) {
      // Only actor is selected
      selectedData = vis.data[vis.selectedActor["actor"]]
    } else if (vis.selectedActor === null && vis.selectedGenre !== null) {
      // Only genre is selected
      selectedData = vis.data[vis.selectedGenre]
    } else {
      // Both genre AND actor are selected
      // Get actor data
      let actorData = vis.data[vis.selectedActor["actor"]]
      // Deep clone array
      actorData = JSON.parse(JSON.stringify(actorData))
      // Make all genres in yearObj that are not vis.selectedGenre or "year" have 0 count
      actorData["series"].forEach((line) => {
        if (line["name"] !== vis.selectedGenre) {
          line["values"] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      })
      selectedData = actorData
    }

    // Update vis.entity
    vis.entity = selectedData

    // Update circle data
    vis.circleData = []
    vis.entity.series.forEach((line, idx) => {
      line["values"].forEach((val) => {
        vis.circleData.push({name: line["name"], value: val});
      });
    });

    // Calculate vis.yScale from vis.entity
    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.entity["series"], d => d3.max(d["values"]))]).nice()
      .range([vis.height, 0]);

    // Filter to only include integers in axis ticks
    vis.yAxisTicks = vis.yScale.ticks()
      .filter(tick => Number.isInteger(tick));

    // Apply filter to only include integer axis ticks and format
    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickValues(vis.yAxisTicks)
      .tickFormat(d3.format('d'));

    // Define line
    vis.line = d3.line()
        .defined(d => !isNaN(d))
        .x((d, i) => vis.xScale(vis.entity["dates"][i]))
        .y(d => vis.yScale(d))

    vis.render();
  }

  render() {
    let vis = this;

    vis.yAxisG
      .transition().duration(vis.transitionTime)
      .call(vis.yAxis);

    vis.chart.selectAll("path.line")
      .data(vis.entity.series, d => d.name)
      .join("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke-width", 1.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .style("mix-blend-mode", "multiply")
        .transition().duration(vis.transitionTime)
          .attr("stroke", d => vis.colourScale(d["name"]))
          .attr("d", d => vis.line(d["values"]));

    vis.chart.selectAll("circle.line")
      .data(vis.circleData, (d, i) => d.name + i % vis.circleData.filter(f => f.name === d.name).length)
      .join("circle")
        .attr("class", "line")
        .attr("r", d => d["value"] === 0 ? 0 : 2)
        .attr("fill", "white")
        .transition().duration(vis.transitionTime)
          .attr("stroke", d => vis.colourScale(d["name"]))
          .attr("cx", (d, i) => vis.xScale(vis.entity["dates"][i % 11]))
          .attr("cy", d => vis.yScale(d["value"]));
  }
}
