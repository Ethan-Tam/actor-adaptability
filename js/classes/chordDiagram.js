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
        .curve(d3.curveBundle.beta(2.5));

    // Create the colour scale
    vis.scale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(vis.genres);

    vis.outerRadius = 300;
    let genreStartPositionMap = {};
    let gapAngle = 5;
    let nextAngle = 0;
    vis.rectWidth = 2 * Math.PI * vis.outerRadius / (vis.nodes.length + gapAngle * vis.genres.length)
    let angleShift = 360 / (vis.nodes.length + gapAngle * vis.genres.length);

    vis.idToNode = {};
    let lastGenre = ""
    vis.nodes.forEach((n, i) => {
      nextAngle += angleShift;
      if (lastGenre !== n.genre) {
        nextAngle += angleShift * gapAngle;
        lastGenre = n.genre;
      }
      n.ang = nextAngle - angleShift / 2;
      n.x = vis.centreX + Math.cos(Math.PI * nextAngle / 180) * vis.outerRadius;
      n.y = vis.centreY + Math.sin(Math.PI * nextAngle / 180) * vis.outerRadius;
      vis.idToNode[n.uid] = n;
    });

    vis.links.forEach(l => {
      l.source = vis.idToNode[l.source];
      l.target = vis.idToNode[l.target];
    });

    vis.paths = vis.links.map(l => {
      let line = [];
      line.push({ x: l.source.x, y: l.source.y,
        c: d3.color(vis.scale(l.source.genre)),
        s: l.source.genre });
      let meanX = (l.source.x + l.target.x + vis.centreX) / 3;
      let meanY = (l.source.y + l.target.y + vis.centreY) / 3;
      line.push({ x: meanX, y: meanY });
      line.push({ x: l.target.x, y: l.target.y,
        c: d3.color(vis.scale(l.target.genre)),
        s: l.target.genre });
      return line;
    });
  }

  render() {
    let vis = this;

    // Render the lines
    vis.linkLines = vis.chart.selectAll('.link')
        .data(vis.paths)
      .join('path')
        .attr('class', 'link')
        .attr('stroke-width', vis.rectWidth)
        .attr('stroke', d => {
          let colour = d[0].c;
          return colour;
        })
        .attr('fill', 'none')
        .attr('d', d => vis.line(d))
      .transition()
        .attr('opacity', d => vis.selected.length === 0 ||
          (vis.selected.includes(d[0].s) && vis.selected.includes(d[2].s)) ? 0.3 : 0);

    // Render the nodes
    vis.nodeCircles = vis.chart.selectAll('.node')
        .data(vis.nodes, d => d.name)
      .join('rect')
        .attr('class', 'node')
        .attr('r', vis.radius)
        .attr('fill', d => vis.scale(d.genre))
        .attr('x', vis.centreX + vis.outerRadius)
        .attr('y', vis.centreY)
        .attr('width', d => vis.aToG[d.name].length / 10 * 40)
        .attr('height', vis.rectWidth)
        .attr('transform', d => `rotate(${d.ang + ',' + vis.centreX + ',' + vis.centreY})`)
      .transition()
        .attr('opacity', d => vis.selected.length === 0 || vis.selected.includes(d.genre) ? 1 : 0);
  }
}
