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

    // Set up background for click off events
    vis.chart.selectAll("rect")
        .data([null])
      .join("rect")
        .attr("id", "background")
        .attr("fill", "white")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", vis.width)
        .attr("height", vis.height)
        .on("click", d => vis.select(null));

    // Set up constants
    vis.centreX = vis.width / 2;
    vis.centreY = vis.height / 2;

    vis.fullOpacity = 1;
    vis.fadeOpacity = 0.3;

    vis.selectColour = "chartreuse";

    vis.outerRadius = 260;
    vis.innerRadius = vis.outerRadius - 15;

    vis.nodeRadius = 4;

    vis.nodeCircles = vis.chart.selectAll('.node');
    vis.linkLines = vis.chart.selectAll('.link');

    // Process the nodes
    vis.nodes.forEach(n => {
      n.genres = n.genres.filter(g => vis.genres.includes(g.genre));
    });
    vis.nodes = vis.nodes.filter(n => n.genres.length > 0);

    // Create colour map
    vis.colourScale = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(d3.range(vis.genres.length));

    // Create genre index map
    vis.genreMap = {};
    vis.genres.forEach((g, i) => {
      vis.genreMap[g] = i;
    });

    // Create chord
    vis.chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.ascending)
        (vis.matrix);

    // Create genre position map
    vis.genrePos = {};
    vis.genres.forEach(g => {
      let group = vis.chord.groups[vis.genreMap[g]];
      let x = vis.getXFromAngle(group, (vis.innerRadius + vis.outerRadius) / 2);
      let y = vis.getYFromAngle(group, (vis.innerRadius + vis.outerRadius) / 2);
      vis.genrePos[g] = { x: x, y: y };
    });

    // Create the links
    vis.links = [];
    vis.actorToLinks = {};
    vis.nodes.forEach(n => {
      let links = [];
      n.genres.forEach(g => {
        links.push({ actor: n.actor, genre: g.genre,
          source: { x: 0, y: 0 }, target: vis.genrePos[g.genre] });
      });
      vis.actorToLinks[n.actor] = d3.range(links.length).map(l => l + vis.links.length);
      vis.links.push(...links);
    });

    // Draw arcs
    vis.arcs = vis.chart.datum(vis.chord)
       .selectAll("g")
       .data(d => d.groups, d => vis.genres[d.index])
      .join("g")
      .append("path")
        .attr("id", d => "group" + d.index)
        .attr("fill", d => vis.colourScale(d.index))
        .attr("stroke", "black")
        .attr("d", d3.arc().innerRadius(vis.innerRadius).outerRadius(vis.outerRadius))
        .attr("transform", `translate(${vis.centreX}, ${vis.centreY})`)
        .attr('opacity', vis.fullOpacity)
        .on("click", d => vis.select(vis.genres[d.index]))
        .on("mouseover", d => vis.hover(vis.genres[d.index]))
        .on("mouseout", d => vis.hover(null));

    // Draw arc labels
    vis.labels = vis.chart
        .selectAll("text")
        .data(vis.chord.groups, d => vis.genres[d.index])
      .join("text")
        .attr("dx", 10)
        .attr("dy", -8)
      .append("textPath")
        .attr("xlink:href", d => "#group" + d.index)
        .text(d => vis.genres[d.index])
        .attr("fill", d => vis.colourScale(d.index))
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr('opacity', vis.fullOpacity);

    // Create network simulation
    vis.tickCount = 0;
    vis.sim = d3.forceSimulation(vis.nodes)
        // Make them not collide with each other
        .force('collide', d3.forceCollide().radius(vis.nodeRadius).strength(1))
        // Make force towards centre
        .force('x', d3.forceX().x(d => {
          let radius =d.genres.length > 1 ? vis.innerRadius : 1.42 * vis.innerRadius;
          let points = d.genres.map(g => g.count * vis.getXFromAngle(vis.chord.groups[vis.genreMap[g.genre]],
                                                                     radius));
          let sum = points.reduce((acc, cv) => acc + cv, 0);
          let count = d.genres.reduce((acc, cv) => acc + cv.count, 0);
          return sum / count;
        }))
        .force('y', d3.forceY().y(d => {
          let radius =d.genres.length > 1 ? vis.innerRadius : 1.42 * vis.innerRadius;
          let points = d.genres.map(g => g.count * vis.getYFromAngle(vis.chord.groups[vis.genreMap[g.genre]],
                                                                     radius));
          let sum = points.reduce((acc, cv) => acc + cv, 0);
          let count = d.genres.reduce((acc, cv) => acc + cv.count, 0);
          return sum / count;
        }))
        // On tick update nodes and edges
        .on('tick', () => {
          vis.tickCount += 1;
          vis.nodeCircles
              .attr('cx', d => {
                vis.actorToLinks[d.actor].forEach(l => {
                  vis.links[l].source.x = d.x;
                });
                return d.x;
              })
              .attr('cy', d => {
                vis.actorToLinks[d.actor].forEach(l => {
                  vis.links[l].source.y = d.y;
                });
                return d.y;
              });
        });

    // Reader does not have to see node movement, fast forward 300 ticks
    vis.sim.tick(300);

    // Set this so lines must be rendered on first select
    vis.linesRendered = false;

    // Render the nodes
    vis.nodeCircles = vis.nodeCircles
          .data(vis.nodes, d => d.actor)
        .join('circle')
          .attr('class', 'node')
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', vis.nodeRadius)
          .attr('fill', d => {

            if (d.genres.length > 1) {
              d.genres.sort((a, b) => {
                return b.count - a.count;
              });
              if (d.genres[0].count === d.genres[1].count)
                d.unhoveredColour = "grey";
              else
                d.unhoveredColour = vis.colourScale(vis.genreMap[d.genres[0].genre]);
            } else
              d.unhoveredColour = vis.colourScale(vis.genreMap[d.genres[0].genre]);
            return d.unhoveredColour;
          })
          .attr('opacity', vis.fullOpacity)
          .attr('actor', d => d.actor)
          .attr('numGenres', d => d.genres.length)
          .attr("transform", `translate(${vis.centreX}, ${vis.centreY})`)
          .on("click", d => vis.select(d))
          .on("mouseover", d => vis.hover(d))
          .on("mouseout", d => vis.hover(null));
  }

  render() {
    let vis = this;

    // If we haven't before, render links
    if (!vis.linesRendered)
      vis.renderLines();

    // Select/hover links
    vis.linkLines
      .transition(100)
        .attr("opacity", d => {
          if (vis.selected !== null &&
              (vis.selected === d.genre ||
               vis.selected.actor === d.actor))
            return 1;
          return 0;
        });

    // Select/hover nodes
    vis.nodeCircles
        .attr("fill", d => {
          if (vis.hovered === d)
            return vis.selectColour;
          else
            return d.unhoveredColour;
        })
      .transition(100)
        .attr("opacity", d => {
          if (vis.selected === null ||
              vis.selected === d ||
              d.genres.map(g => g.genre).includes(vis.selected))
            return vis.fullOpacity;
          else
            return vis.fadeOpacity;
        });;

    // Select/hover arcs
    vis.arcs
        .attr("fill", d => {
          if (vis.hovered === vis.genres[d.index])
            return vis.selectColour;
          else
            return vis.colourScale(d.index);
        })
      .transition(100)
        .attr("opacity", d => {
          if (vis.selected === null ||
              vis.selected === vis.genres[d.index] ||
              (vis.selected.genres !== undefined &&
               vis.selected.genres.map(g => g.genre).includes(vis.genres[d.index])))
            return vis.fullOpacity;
          else
            return vis.fadeOpacity;
        });
  }

  renderLines() {
    let vis = this;

    // Draw links
    vis.linkLines = vis.chart
        .selectAll(".link")
        .data(vis.links)
      .join("path")
        .attr('class', 'link')
        .attr('stroke-width', 2)
        .attr('stroke', 'lightgrey')
        .attr('fill', 'none')
        .attr('d', (d, i) => {
          let line = 'M' + (d.source.x + vis.centreX) + ' ' + (d.source.y + vis.centreY)
              + ' L' + (d.target.x + vis.centreX) + ' ' + (d.target.y + vis.centreY);
          return line;
        });

    d3.selectAll(".link").lower();
    d3.selectAll("#background").lower();
    vis.linesRendered = true;
  }

  getXFromAngle(g, radius) {
    return Math.cos((g.startAngle + g.endAngle) / 2 - Math.PI / 2) * radius;
  }

  getYFromAngle(g, radius) {
    return Math.sin((g.startAngle + g.endAngle) / 2 - Math.PI / 2) * radius;
  }
}
