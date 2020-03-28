class stackedBarChart {
  constructor(_config) {
	// Set up configuration of visualization
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 700,
      margin: _config.margin || { top: 30, bottom: 60, right: 20, left: 100 }
    }
  }

  initVis() {
    let vis = this;

    // console.log(vis.data["columns"])
    // Compute the size of the visualization for later use
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Create the chart and set initial configuration
    vis.chart = d3.select(vis.config.parentElement).append("g")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // x-value selector function
    vis.xValue = d => d.year;

    // Compute x-scale
    vis.xScale = d3.scaleBand()
      .domain([2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016])
      .range([0, vis.width])
      .padding(0.1);

    // Initialize vis.series to "all"
    vis.series = vis.getSeriesFromData("all");
    // console.log(vis.data["Action"])
    // console.log(vis.series)

    vis.xAxis = d3.axisBottom(vis.xScale);

    vis.render();
  }

  update() {
    let vis = this;
    let selected = "all"

    if (vis.selectedActor !== null)
      selected = vis.selectedActor["actor"]
    else if (vis.selectedGenre !== null)
      selected = vis.selectedGenre

    // uncomment following line for sanity check
    // console.log(vis.data[selected])

    // change update vis.series
    vis.series = vis.getSeriesFromData(selected)

    vis.render();
  }

  render() {
    let vis = this;

    // calculate vis.yScale from vis.series
    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.series, d => d3.max(d, d => d[1]))])
      .range([vis.height, 0]);

    // assign colours and render bars
    vis.chart.selectAll("g")
      .data(vis.series)
      .join("g")
        .attr("fill", d => vis.colourScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", d => vis.xScale(vis.xValue(d.data)))
        .attr("y", d => vis.yScale(d[1]))
        .attr("height", d => vis.yScale(d[0]) - vis.yScale(d[1]))
        .attr("width", vis.xScale.bandwidth())

    // Add x-axis
    vis.xAxisG = vis.chart.append("g")
      .attr("id", "xAxis")
      .attr("transform", `translate(0,${vis.height})`)
      .call(vis.xAxis);

    // Filter to to only include integers in axis ticks 
    vis.yAxisTicks = vis.yScale.ticks()
      .filter(tick => Number.isInteger(tick));

    // Apply filter to only include integer axis ticks and format
    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickValues(vis.yAxisTicks)
      .tickFormat(d3.format('d'));

    // Add y-axis
    vis.yAxis = vis.chart.append("g")
      .attr("id", "yAxis")
      .call(vis.yAxis);

    // Add chart title
    vis.title = d3.select(vis.config.parentElement).append('text')
      .attr("x", vis.config.margin.left + (vis.width / 2))             
      .attr("y", vis.config.margin.top - 10)
      .attr("text-anchor", "middle")
      .text("Movies counts per year and their genres");
  }

  getSeriesFromData(selectedEntity) {
    let vis = this;
    return d3.stack().keys(vis.data["columns"])(vis.data[selectedEntity])
  }
}
