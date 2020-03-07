class VariedBarChart {
  constructor(_config) {
    // Keep track of the data which came from the data processing
    this.data = _config.data;

    // Set up configuration of visualization
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1000,
      containerHeight: _config.containerHeight || 700,
      margin: _config.margin || { top: 10, bottom: 60, right: 20, left: 100 }
    }

    this.initVis();
  }

  initVis() {
    let vis = this;

    // Compute the size of the visualization for later use
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    // Get all ages so range can be computed
    let allAges = vis.data.year_2011.male
                    .concat(vis.data.year_2011.female)
                    .concat(vis.data.year_2016.male)
                    .concat(vis.data.year_2016.female);

    // Create the y scale and axis
		vis.yScale = d3.scaleBand()
          .domain(allAges.map(d => d.age))
		      .rangeRound([vis.height, 0])
		      .padding(.3);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickValues(vis.yScale.domain().filter((d,i) => !(i%10)));

    // Create the chart and set initial configuration
    vis.chart = d3.select(vis.config.parentElement).append("g")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("transform", `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Add y axis labels
    vis.yAxisG = vis.chart.append("g").call(vis.yAxis);
    vis.yAxisG.append("text")
        .attr("class", "axis-label")
        .attr("y", -80)
        .attr("x", -vis.height / 2)
        .attr("transform", `rotate(-90)`)
        .attr("text-anchor", "middle")
        .text("Age");
  }

  update(mode, year) {
    let vis = this;

    // Store the current state
    vis.mode = mode;
    vis.sel = "year_" + year;

    vis.render();
  }

  render() {
    let vis = this;

    // Declare abstracted variables for later setting and use
    let mxScale, fxScale;
    let mgetX, fgetX;
    let mgetY, fgetY;
    let height, ticks;

    // Set variables depending on layout
    switch (vis.mode) {
      case "pyramid":
        // Pyramid bar charts need two different x scales and axes
        let mmax = Math.max(...vis.data[vis.sel].male.map(d => d.count));
        let fmax = Math.max(...vis.data[vis.sel].female.map(d => d.count));
        vis.xScaleMale = d3.scaleLinear()
              .domain([0, mmax])
              .range([vis.width / 2, 0]);
        vis.xScaleFemale = d3.scaleLinear()
              .domain([0, fmax])
              .range([0, vis.width / 2]);

        mxScale = vis.xScaleMale;
        fxScale = vis.xScaleFemale;
        mgetX = d => mxScale(d.count);
        fgetX = d => vis.width / 2;
        mgetY = d => vis.yScale(d.age);
        fgetY = d => vis.yScale(d.age);
        height = vis.yScale.bandwidth();
        ticks = 5;
        break;
      case "stacked":
        // Stacked bar charts only need a single x scale and axis
        vis.xScaleTotal = d3.scaleLinear()
              .domain([0, vis.data[vis.sel].tm])
              .range([0, vis.width]);

        mxScale = vis.xScaleTotal;
        fxScale = vis.xScaleTotal;
        mgetX = d => 0;
        fgetX = d => mxScale(d.acount); // Start female bar at the end of male bar
        mgetY = d => vis.yScale(d.age);
        fgetY = d => vis.yScale(d.age);
        height = vis.yScale.bandwidth();
        ticks = 10;
        break;
      case "grouped":
        vis.xScaleMax = d3.scaleLinear()
              .domain([0, vis.data[vis.sel].gm])
              .range([0, vis.width]);
        mxScale = vis.xScaleMax;
        fxScale = vis.xScaleMax;
        mgetX = d => 0;
        fgetX = d => 0;
        mgetY = d => vis.yScale(d.age);
        fgetY = d => vis.yScale(d.age) + height;
        height = vis.yScale.bandwidth() / 2; // Both sexes' bars must fit on same line
        ticks = 10;
        break;
    }

    // Render the male bars with transitions
    vis.chart.selectAll(".male-bars")
        .data(vis.data[vis.sel].male)
      .join("rect")
        .attr("fill", d => "#5B0E2D")
        .attr("class", "male-bars")
        .transition(1000)
          .attr('x', d => mgetX(d))
          .attr('y', d => mgetY(d))
          .attr("width", d => {
            // If in pyramid layout, x scale for male bars is reversed
            let x = mxScale(d.count);
            if (mode === "pyramid")
              return vis.width / 2 - x;
            else
              return x;
          })
          .attr('height', height);

    // Render the female bars with transitions
    vis.chart.selectAll(".female-bars")
        .data(vis.data[vis.sel].female)
      .join("rect")
        .attr("fill", d => "#FFA781")
        .attr("class", "female-bars")
        .transition(1000)
          .attr('x', d => fgetX(d))
          .attr('y', d => fgetY(d))
          .attr("width", d => fxScale(d.count))
          .attr('height', height);

    // Define x axis
    let mxAxis = d3.axisBottom(mxScale)
        .ticks(ticks);

    // Remove old x axes
    vis.chart.selectAll(".x-axis").remove();

    // Add the x axis itself in the correct position
    vis.xAxisGM = vis.chart.append("g").call(mxAxis)
        .attr("transform", `translate(0,${vis.height})`)
        .attr("class", "x-axis");

    // Add labels to the x axis
    vis.xAxisGM.append("text")
        .attr("class", "x-axis")
        .attr("y", 50)
        .attr("x", vis.width / 2)
        .text("Population");

    if (mode === "pyramid") {
      // If pyramid mode, need an extra axis for female bars
      let fxAxis = d3.axisBottom(fxScale)
          .ticks(ticks);
      vis.xAxisGF = vis.chart.append("g").call(fxAxis)
          .attr("transform", `translate(${vis.width / 2},${vis.height})`)
          .attr("class", "x-axis");
      vis.xAxisGF.append("text")
          .attr("class", "x-axis")
          .attr("y", 50)
          .attr("x", vis.width / 2);
    }

  }
}
