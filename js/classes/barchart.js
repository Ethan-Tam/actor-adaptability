class stackedBarChart {
  constructor(_config) {
	// Set up configuration of visualization
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 700,
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

    // x-value selector function
    vis.xValue = d => d.year;

    // Compute x-scale
    vis.xScale = d3.scaleBand()
      .domain([2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016])
      .range([0, vis.width])
      .padding(0.1);

    // Set vis.xAxis
    vis.xAxis = d3.axisBottom(vis.xScale);

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
      .attr('font-weight', 'bold')
      .attr("text-anchor", "middle")
      .text("Movies counts per year and their genres");

    vis.update();
  }

  update() {
    let vis = this;
    let selectedData;

    // uncomment line below to test selecting actor and genre
    // vis.selectedGenre = "Action"

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
      actorData.forEach((yearObj, idx) => {
        Object.entries(yearObj).forEach(([genre, count]) => {
          if (genre !== vis.selectedGenre && genre !== "year") {
            actorData[idx][genre] = 0
          }
        });
      });
      selectedData = actorData
    }

    // Update vis.series
    vis.series = vis.getSeriesFromData(selectedData)

    // Calculate vis.yScale from vis.series
    vis.yScale = d3.scaleLinear()
      .domain([0, d3.max(vis.series, d => d3.max(d, d => d[1]))])
      .range([vis.height, 0]);

    // Filter to only include integers in axis ticks
    vis.yAxisTicks = vis.yScale.ticks()
      .filter(tick => Number.isInteger(tick));

    // Apply filter to only include integer axis ticks and format
    vis.yAxis = d3.axisLeft(vis.yScale)
      .tickValues(vis.yAxisTicks)
      .tickFormat(d3.format('d'));

    vis.render();
  }

  render() {
    let vis = this;

    vis.yAxisG
      .transition().duration(vis.transitionTime)
      .call(vis.yAxis);

    // assign colours and render bars
    vis.chart.selectAll("g.bar")
      .data(vis.series)
      .join("g")
        .attr("class", "bar")
        .attr("fill", d => vis.colourScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .join("rect")
        .attr("x", d => vis.xScale(vis.xValue(d.data)))
        .attr("width", vis.xScale.bandwidth())
        .transition().duration(vis.transitionTime)
          .attr("y", d => vis.yScale(d[1]))
          .attr("height", d => vis.yScale(d[0]) - vis.yScale(d[1]))
  }

  getSeriesFromData(selectedData) {
    let vis = this;
    return d3.stack().keys(vis.data["columns"])(selectedData)
  }
}
