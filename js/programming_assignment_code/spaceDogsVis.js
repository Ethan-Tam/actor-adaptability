class SpaceDogsVis {

  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 150, bottom: 12, right: 150, left: 100 }
    }

    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;
  }

  initVis() {
    let vis = this;

    // Create the chart
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Get the initial selection
    vis.nodeCircles = vis.chart.selectAll('.node');

    // Set circle radius
    vis.rad = 12;

    // Start the force simulation
    vis.sim = d3.forceSimulation()
        // Make the repel each other
        .force('charge', d3.forceManyBody().strength(-500))
        // On tick update nodes and edges
        .on('tick', () => {
          vis.nodeCircles
              .attr('cx', d => d.x)
              .attr('cy', d => d.y);

          vis.linkLines
              .attr('d', (d, i) => {
                let ax = (d.target.x + d.source.x) / 2;
                let dx = Math.abs(d.target.x - d.source.x);
                let ay = Math.max(d.target.y, d.source.y) - 4 * Math.sqrt(dx);
                return 'M' + d.source.x + ' ' + d.source.y
                  + ' Q' + ax + ' ' + ay + ' '
                  + d.target.x + ' ' + d.target.y;
              });
        });

    // Create the scale
    vis.scale = d3.scaleTime()
        .domain(d3.extent(vis.nodes.map(d => d.first)))
        .range([vis.height, 0])
        .nice();

    // Process the nodes for x and y position
    vis.nodes.forEach((d, i) => {
      d.x = d.survived ? i : vis.config.containerWidth - i;
      d.fy = vis.scale(d.first);
    });

    // Set up updated nodes and links
    vis.sim.nodes(vis.nodes)
        .force('x', d3.forceX().strength(0.4).x(d => d.survived ? vis.width / 2 - 150 : vis.width / 2 + 150))
        .force('link', d3.forceLink(vis.links).id(d => d['Name (Latin)']).strength(0.18));

    // Create the y axis
    vis.axis = d3.axisLeft(vis.scale)
        .tickFormat(d3.timeFormat('%Y'))
        .ticks(20);

    // Add y axis labels
    vis.axisG = vis.chart.append('g')
        .call(vis.axis)
          .attr('class', 'axis')
          .attr('font-size', 12);

    // Add y axis title
    vis.axisG.append('text')
        .attr('class', 'axis')
        .attr('y', -80)
        .attr('x', -vis.height / 2)
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .text('Year of First Flight');

    // Create hover details
    vis.createDetails();
  }

  render() {
    let vis = this;

    // Render the lines
    vis.linkLines = vis.chart.selectAll('.link')
        .data(vis.links)
      .join('path')
        .attr('class', 'link')
        .attr('stroke-width', 2)
        .attr('stroke', 'white')
        .attr('fill', 'none')
        .attr('opacity', d => {
          let s = d.source['Name (Latin)'] === vis.selectedDog;
          let t = d.target['Name (Latin)'] === vis.selectedDog;
          return s || t || vis.selectedDog === undefined ? 1 : 0.2;
        });

    // Render the nodes
    vis.nodeCircles = vis.chart.selectAll('.node')
          .data(vis.nodes, d => d['Name (English)'])
        .join('circle')
          .on('click', d => vis.click(d['Name (Latin)']))
          .on('mouseover', d => {
            d3.select('#details').raise();
            vis.updateDetails(d);
            vis.dets.main.attr('opacity', 0.8);
          })
          .on('mouseout', d => {
            d3.select('#details').lower();
            vis.dets.main.attr('opacity', 0);
          })
          .attr('class', 'node')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', vis.rad)
          .attr('fill', d => d.Gender === 'Male' ? 'darkorange' : 'turquoise')
          .attr('opacity', d => vis.selectedDog === undefined || vis.link_map[vis.selectedDog].includes(d['Name (Latin)']) ? 1 : 0.2);

    // Bring details box to front
    d3.select('#details').raise();
  }

  createDetails() {
    let vis = this;

    vis.dets = {};

    // Make details group
    vis.dets.main = vis.chart.append('g')
        .attr('id', 'details')
        .attr('opacity', 0)
        .attr('transform', `translate(200,200)`);

    // Outline
    vis.dets.border = vis.dets.main.append('rect')
        .attr('width', 350)
        .attr('height', 60)
        .attr('fill', '#33FF00');

    // Inner box
    vis.dets.inner = vis.dets.main.append('rect')
        .attr('x', 2)
        .attr('y', 2)
        .attr('width', 346)
        .attr('height', 56)
        .attr('fill', 'black');

    // Name
    vis.dets.name = vis.dets.main.append('text')
        .attr('id', 'name')
        .attr('x', 4)
        .attr('y', 18)
        .attr('font-size', 16)
        .text('hi');

    // Flights
    vis.dets.flights = vis.dets.main.append('text')
        .attr('id', 'flights')
        .attr('x', 4)
        .attr('y', 36)
        .attr('font-size', 16)
        .text('flights');

    // Fate
    vis.dets.fate = vis.dets.main.append('text')
        .attr('id', 'fate')
        .attr('x', 4)
        .attr('y', 54)
        .attr('font-size', 16)
        .text('fate');
  }

  updateDetails(d) {
    let vis = this;

    vis.dets.name.text(d['Name (English)']);
    vis.dets.flights.text(d['Flights']);
    vis.dets.fate.text(d['Fate']);
    vis.dets.main.attr('transform', `translate(${d.x},${d.y - 74})`);

    let innerWidth = Math.max(vis.dets.name.node().getBBox().width,
                              vis.dets.flights.node().getBBox().width,
                              vis.dets.fate.node().getBBox().width);

    vis.dets.inner.attr('width', Math.ceil(innerWidth) + 4);
    vis.dets.border.attr('width', Math.ceil(innerWidth) + 8);
  }
}
