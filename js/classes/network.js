// Class for network visualization
class Network {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 1200,
      containerHeight: _config.containerHeight || 600,
      margin: _config.margin || { top: 0, bottom: 0, right: 0, left: 0 },
    };

    this.width = this.config.containerWidth - this.config.margin.left - this.config.margin.right;
    this.height = this.config.containerHeight - this.config.margin.top - this.config.margin.bottom;
  }

  initVis() {
    let vis = this;

    // Set up constants
    vis.centreX = vis.width / 2;
    vis.centreY = vis.height / 2;

    vis.outerRadius = 220;
    vis.innerRadius = vis.outerRadius - 15;

    // Create the chart
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg
      .append('g')
      .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Set up background for click off events
    vis.chart
      .selectAll('rect')
      .data([null])
      .join('rect')
      .attr('id', 'background')
      .attr('fill', 'white')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', vis.width)
      .attr('height', vis.height)
      .on('click', () => vis.select(null));

    // Set up tooltip
    vis.tg = vis.chart.append('g');
    vis.tb = vis.tg
      .append('rect')
      .attr('fill', 'black')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', 20);
    vis.tr = vis.tg
      .append('rect')
      .attr('fill', 'white')
      .attr('x', 1)
      .attr('y', 1)
      .attr('width', 0)
      .attr('height', 18);
    vis.tt = vis.tg
      .append('text')
      .attr('fill', 'black')
      .attr('x', 3)
      .attr('y', 15)
      .attr('font-size', 12)
      .text('');

    // Create radius scale
    vis.getNumMovies = d => d.genres.reduce((acc, cv) => acc + cv.count, 0);
    let numMovies = vis.nodes.map(vis.getNumMovies);
    vis.radiusScale = d3.scaleLinear().domain(d3.extent(numMovies)).range([3, 7]);

    // Create line thickness scale
    let numMoviesPerGenre = [];
    vis.nodes.forEach(d => {
      let nums = d.genres.map(d => d.count);
      numMoviesPerGenre.push(...nums);
    });
    vis.thicknessScale = d3.scaleLinear().domain(d3.extent(numMoviesPerGenre)).range([1, 6]);

    vis.nodeCircles = vis.chart.selectAll('.node');
    vis.linkLines = vis.chart.selectAll('.link');

    // Create chord
    vis.chord = d3.chord().padAngle(0.05).sortSubgroups(d3.ascending)(vis.matrix);

    // Create genre position map
    vis.genrePos = {};
    vis.genres.forEach(g => {
      let group = vis.chord.groups[vis.genreMap[g]];
      let x = vis.getXFromAngle(group, (vis.innerRadius + vis.outerRadius) / 2);
      let y = vis.getYFromAngle(group, (vis.innerRadius + vis.outerRadius) / 2);
      vis.genrePos[g] = { x: x, y: y };
    });

    // Remove loading text and show hidden things
    d3.select('#loading-text').remove();
    d3.selectAll('.static').classed('static', false);

    // Draw arcs
    vis.arcs = vis.chart
      .datum(vis.chord)
      .selectAll('g.arc')
      .data(
        d => d.groups,
        d => vis.genres[d.index],
      )
      .join('g')
      .attr('class', 'arc selectable')
      .append('path')
      .attr('id', d => 'group' + d.index)
      .attr('fill', d => vis.colourScale(vis.genres[d.index]))
      .attr('stroke', 'black')
      .attr('d', d3.arc().innerRadius(vis.innerRadius).outerRadius(vis.outerRadius))
      .attr('transform', `translate(${vis.centreX}, ${vis.centreY})`)
      .attr('opacity', vis.fullOpacity)
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .on('click', d => vis.select(vis.genres[d.index]))
      .on('mouseover', d => vis.hover(vis.genres[d.index]))
      .on('mouseout', () => vis.hover(null));

    // Draw arc labels
    vis.labels = vis.chart
      .selectAll('text.arc')
      .data(vis.chord.groups, d => vis.genres[d.index])
      .join('text')
      .attr('dx', 10)
      .attr('dy', -8)
      .attr('class', 'arc')
      .append('textPath')
      .attr('xlink:href', d => '#group' + d.index)
      .text(d => vis.genres[d.index])
      .attr('fill', d => vis.colourScale(vis.genres[d.index]))
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('opacity', vis.fullOpacity);

    // Render the nodes
    vis.nodeCircles = vis.nodeCircles
      .data(vis.nodes, d => d.actor)
      .join('circle')
      .attr('class', 'node selectable')
      .attr('cx', d => d.pos.x)
      .attr('cy', d => d.pos.y)
      .attr('r', d => vis.radiusScale(vis.getNumMovies(d)))
      .attr('fill', d => {
        if (d.genres.length > 1) {
          let sortedGenres = [...d.genres];
          sortedGenres.sort((a, b) => b.count - a.count);
          if (sortedGenres[0].count === sortedGenres[1].count) d.unhoveredColour = 'grey';
          else d.unhoveredColour = vis.colourScale(sortedGenres[0].genre);
        } else d.unhoveredColour = vis.colourScale(d.genres[0].genre);
        return d.unhoveredColour;
      })
      .attr('opacity', vis.fullOpacity)
      .attr('actor', d => d.actor)
      .attr('stroke', 'black')
      .attr('stroke-width', 0)
      .attr('numGenres', d => d.genres.length)
      .attr('transform', `translate(${vis.centreX}, ${vis.centreY})`)
      .on('click', d => vis.select(d))
      .on('mouseover', d => {
        vis.hover(d);
        vis.updateTooltip(d);
        vis.tg.attr('opacity', 1);
        vis.tg.raise();
      })
      .on('mouseout', () => {
        vis.hover(null);
        vis.tg.attr('opacity', 0);
        vis.tg.lower();
      });

    // Draw links
    vis.linkLines = vis.chart
      .selectAll('.link')
      .data(vis.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke-width', d => d.thickness)
      .attr('stroke', 'lightgrey')
      .attr('fill', 'none')
      .attr('opacity', 0)
      .attr('x1', d => d.source.x + vis.centreX)
      .attr('y1', d => d.source.y + vis.centreY)
      .attr('x2', d => d.target.x + vis.centreX)
      .attr('y2', d => d.target.y + vis.centreY)
      .on('click', () => vis.select(null));

    d3.selectAll('.link').lower();
    d3.selectAll('#background').lower();

    vis.tg.raise();
  }

  render() {
    let vis = this;

    // Show lines on select
    vis.linkLines
      .transition()
      .duration(vis.transitionTime)
      .attr('opacity', d => {
        if (
          (vis.selectedActor === null ? true : vis.selectedActor.actor === d.actor) &&
          (vis.selectedGenre === null ? true : vis.selectedGenre === d.genre) &&
          (vis.selectedActor !== null || vis.selectedGenre !== null)
        )
          return 1;
        return 0;
      });

    // Select/hover nodes
    vis.nodeCircles
      .attr('stroke-width', d => {
        if (vis.hovered === d || d.genres.map(g => g.genre).includes(vis.hovered))
          return vis.selectStrokeWidth;
        else return 0;
      })
      .transition()
      .duration(vis.transitionTime)
      .attr('opacity', d => {
        if (
          (vis.selectedActor === null ? true : vis.selectedActor === d) &&
          (vis.selectedGenre === null
            ? true
            : d.genres.map(g => g.genre).includes(vis.selectedGenre))
        )
          return vis.fullOpacity;
        else return vis.fadeOpacity;
      });

    // Select/hover arcs
    vis.arcs
      .attr('stroke-width', d => {
        if (vis.hovered === vis.genres[d.index]) return vis.selectStrokeWidth;
        else return 0;
      })
      .transition()
      .duration(vis.transitionTime)
      .attr('opacity', d => {
        if (
          (vis.selectedActor === null
            ? true
            : vis.selectedActor.genres.map(g => g.genre).includes(vis.genres[d.index])) &&
          (vis.selectedGenre === null ? true : vis.selectedGenre === vis.genres[d.index])
        )
          return vis.fullOpacity;
        else return vis.fadeOpacity;
      });

    vis.labels.attr('stroke-width', d => {
      if (vis.hovered === vis.genres[d.index]) return vis.selectStrokeWidth;
      else return 0;
    });
  }

  getXFromAngle(g, radius) {
    return Math.cos((g.startAngle + g.endAngle) / 2 - Math.PI / 2) * radius;
  }

  getYFromAngle(g, radius) {
    return Math.sin((g.startAngle + g.endAngle) / 2 - Math.PI / 2) * radius;
  }

  updateTooltip(d) {
    let vis = this;

    vis.tt.text(d.actor);

    let innerWidth = vis.tt.node().getBBox().width;
    let x = Math.min(vis.width - innerWidth - 12, vis.centreX + d.pos.x);
    let y = vis.centreY + d.pos.y - 28;
    vis.tg.attr('transform', `translate(${x},${y})`);

    vis.tb.attr('width', Math.ceil(innerWidth) + 6);
    vis.tr.attr('width', Math.ceil(innerWidth) + 4);
  }
}
