// Class for network visualization
class ChordDiagram {

  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 0, bottom: 0, right: 0, left: 0 }
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

    vis.centreX = vis.width / 2;
    vis.centreY = vis.height / 2;

    // Get the initial selection
    vis.nodeCircles = vis.chart.selectAll('.node');

    // Set circle radius
    vis.rad = 2;

    // Create the colour scale
    vis.scale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(vis.genres);

    // Start the force simulation
    vis.sim = d3.forceSimulation()
        // Make the repel each other
        .force('charge', d3.forceManyBody().strength(-1))
        .force("radial", d3.forceRadial(300, vis.centreX, vis.centreY).strength(0.5))
        // On tick update nodes and edges
        .on('tick', () => {
          vis.nodeCircles
              .attr('cx', d => d.x)
              .attr('cy', d => d.y);

          vis.linkLines
              .attr('d', (d, i) => {
                return 'M' + d.source.x + ' ' + d.source.y
                  + ' Q' + vis.centreX + ' ' + vis.centreY + ' '
                  + d.target.x + ' ' + d.target.y;
              });
        });

    // Process the nodes for x and y position
    vis.nodes.forEach((d, i) => {
      d.x = vis.centreX;
      d.y = vis.centreY;
    });

    // Set up updated nodes and links
    vis.sim.nodes(vis.nodes)
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
        .attr('fill', 'none');

    // Render the nodes
    vis.nodeCircles = vis.chart.selectAll('.node')
        .data(vis.nodes, d => d.name)
      .join('circle')
        .attr('class', 'node')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', vis.rad)
        .attr('fill', d => vis.scale(d.genre));
  }
}
