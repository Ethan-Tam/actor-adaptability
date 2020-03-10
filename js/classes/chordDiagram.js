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
    vis.radius = 6;

    vis.line = d3.line()
        .x(d => d.x)
        .y(d => d.y)
        .curve(d3.curveBundle.beta(0.7));

    // Create the colour scale
    vis.scale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(vis.genres);

    let genreStartPositionMap = {};
    let numShiftsPerGap = 100;
    let nextAngle = 0;
    let angleShift = 2 * Math.PI / (vis.nodes.length + numShiftsPerGap * vis.genres.length);
    vis.outerRadius = 300;

    vis.idToNode = {};
    let lastGenre = ""
    vis.nodes.forEach((n, i) => {
      nextAngle += angleShift;
      if (lastGenre !== n.genre) {
        nextAngle += angleShift * numShiftsPerGap;
      }
      lastGenre = n.genre;
      n.x = vis.centreX + Math.cos(nextAngle) * vis.outerRadius;
      n.y = vis.centreY + Math.sin(nextAngle) * vis.outerRadius;
      vis.idToNode[n.uid] = n;
    });
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
        .attr('r', vis.radius)
        .attr('fill', d => vis.scale(d.genre));
  }
}
