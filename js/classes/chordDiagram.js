vis.fadeOpacity// Class for network visualization
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

    // Set up constants
    vis.centreX = vis.width / 2;
    vis.centreY = vis.height / 2;

    vis.fullOpacity = 0.8;
    vis.fadeOpacity = 0.3;

    // Create chord
    vis.chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.ascending)
        (vis.matrix);

    // Create colour gradients map
    vis.colourScale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(d3.range(vis.genres.length));

    // Creating the fill gradient
    vis.getGradID = d => "linkGrad-" + d.source.index + "-" + d.target.index;

    vis.outerRadius = 350;
    vis.innerRadius = vis.outerRadius - 15;

    vis.grads = vis.svg.append("defs")
        .selectAll("linearGradient")
        .data(vis.chord)
      .join("linearGradient")
        .attr("id", vis.getGradID)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d, i) => vis.innerRadius * Math.cos((d.source.endAngle-d.source.startAngle) / 2 + d.source.startAngle - Math.PI/2))
        .attr("y1", (d, i) => vis.innerRadius * Math.sin((d.source.endAngle-d.source.startAngle) / 2 + d.source.startAngle - Math.PI/2))
        .attr("x2", (d, i) => vis.innerRadius * Math.cos((d.target.endAngle-d.target.startAngle) / 2 + d.target.startAngle - Math.PI/2))
        .attr("y2", (d, i) => vis.innerRadius * Math.sin((d.target.endAngle-d.target.startAngle) / 2 + d.target.startAngle - Math.PI/2));

    vis.grads.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => vis.colourScale(d.source.index));

    vis.grads.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => vis.colourScale(d.target.index));

    vis.arcs = vis.chart.datum(vis.chord)
        .selectAll("g")
        .data(d => d.groups, d => vis.genres[d.index])
      .join("g");
    vis.labels = vis.chart
        .selectAll("text")
        .data(vis.chord.groups, d => vis.genres[d.index])
      .join("text");
    vis.paths = vis.chart.datum(vis.chord)
        .selectAll("path")
        .data(d => d, d => vis.getGenrePair(d))
      .join("path");

    // Draw arcs
    vis.arcs
      .append("path")
        .attr("id", d => "group" + d.index)
        .style("fill", d => vis.colourScale(d.index))
        .style("stroke", "black")
        .attr("d", d3.arc().innerRadius(vis.innerRadius).outerRadius(vis.outerRadius))
        .attr("transform", `translate(${vis.centreX}, ${vis.centreY})`)
      .transition(800)
        .attr("opacity", 1);

    // Draw arc labels
    vis.labels
        .attr("dx", 10)
        .attr("dy", -8)
      .append("textPath")
        .attr("xlink:href", d => "#group" + d.index)
        .text(d => vis.genres[d.index])
        .style("fill", "black")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
      .transition(800)
        .attr("opacity", 1);

    // Draw ribbons
    vis.paths
        .attr("id", d => vis.getGenrePair(d))
        .attr("class", d => "chord chord-" + d.source.index + " chord-" + d.target.index)
        .style("fill", d => `url(#${vis.getGradID(d)})`)
        .attr("d", d3.ribbon().radius(vis.innerRadius - 5))
        .style("stroke", "black")
        .attr("transform", `translate(${vis.centreX}, ${vis.centreY})`)
        .on("mouseover", d => {
          vis.hover(vis.getGenrePair(d));
          d3.select("#" + vis.getGenrePair(d)).raise();
        })
        .on("mouseout", d => {
          vis.hover(null);
        })
        .on("click",  d => {
          vis.select(vis.getGenrePair(d))
        })
      .transition(800)
        .attr("opacity", vis.fullOpacity);
  }

  render() {
    let vis = this;

    vis.paths.transition(100).attr("opacity", d => {
      if (vis.selected !== null) {
        return vis.selected === vis.getGenrePair(d) ? 0 : vis.fadeOpacity;
      } else if (vis.hovered !== null) {
        return vis.hovered === vis.getGenrePair(d) ? vis.fullOpacity : vis.fadeOpacity;
      } else {
        return vis.fullOpacity;
      }
    });
  }

  getGenrePair(d) {
    let vis = this;
    return vis.genres[d.source.index] + vis.genres[d.target.index];
  }
}
