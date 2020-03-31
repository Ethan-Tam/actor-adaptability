// Class for pie chart visualization
class PieChart {
  constructor(_config) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 400,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 0, bottom: 0, right: 0, left: 0 },
    };

    this.width =
      this.config.containerWidth -
      this.config.margin.left -
      this.config.margin.right;
    this.height =
      this.config.containerHeight -
      this.config.margin.top -
      this.config.margin.bottom;
  }

  initVis() {
    let vis = this;

    vis.segments = d3
      .arc()
      .innerRadius(0)
      .outerRadius(100);

    vis.expandedSegments = d3
      .arc()
      .innerRadius(0)
      .outerRadius(100 + 10);

    // Create the chart
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr('width', vis.config.containerWidth)
      .attr('height', vis.config.containerHeight);

    vis.chart = vis.svg
      .append('g')
      .attr(
        'transform',
        `translate(${vis.config.containerWidth / 2},${vis.config
          .containerHeight / 2})`,
      );

    // Initialize previous angles all to zero
    vis.lastAngles = {};
    vis.genres.forEach(d => {
      vis.lastAngles[d] = { startAngle: 0, endAngle: 0 };
    });
    vis.update();
  }

  update() {
    let vis = this;
    if (vis.selected == null) {
      vis.data = d3
        .pie()
        .value(d => d.actors.length)
        .sort(null)(vis.initialData);
      vis.title = 'All Actors';
    } else {
      // Add all the unincluded genres with count zero
      let genreData = [...vis.selected.genres];
      genreData.push(
        ...vis.genres
          .filter(d => {
            return !vis.selected.genres.map(g => g.genre).includes(d);
          })
          .map(d => {
            return { genre: d, count: 0 };
          }),
      );
      vis.data = d3
        .pie()
        .value(d => d.count)
        .sort((a, b) => vis.genreMap[a.genre] - vis.genreMap[b.genre])(
        genreData,
      );
      vis.title = vis.selected.actor;
    }
    vis.render();
  }

  render() {
    let vis = this;

    // Adds title to piechart
    vis.chart
      .selectAll('text')
      .data(vis.data, d => d.data.genre)
      .join('text')
      .text(vis.title)
      .attr('transform', `translate(${-vis.title.length * 4},${-130})`);

    vis.slices = vis.chart
      .selectAll('path')
      .data(vis.data, d => d.data.genre)
      .join('path')
      .attr('fill', d => vis.colourScale(d.data.genre))
      .on('mouseover', d => {
        vis.hover(d);
      })
      .on('mouseout', () => {
        vis.hover(null);
      });

    vis.slices
      .attr('stroke', 'black')
      .attr('stroke-width', d => {
        if (d == vis.hoveredSlice) {
          return 2;
        }
        return 0;
      })
      .transition()
      .duration(vis.transitionTime)
      .attrTween('d', d => {
        if (d == vis.hoveredSlice) {
          return vis.arcTween(vis.expandedSegments)(d);
        }
        return vis.arcTween(vis.segments)(d);
      });
  }

  // Need to tween since built in interpolation does not work here
  arcTween(arc) {
    return d => {
      let vis = this;
      let interpolateStart = d3.interpolate(
        vis.lastAngles[d.data.genre].startAngle,
        d.startAngle,
      );
      let interpolateEnd = d3.interpolate(
        vis.lastAngles[d.data.genre].endAngle,
        d.endAngle,
      );
      return t => {
        d.startAngle = interpolateStart(t);
        d.endAngle = interpolateEnd(t);
        return arc(d);
      };
    };
  }

  // Store the previous angles for smooth transitions
  saveLastAngles() {
    let vis = this;
    vis.data.forEach(d => {
      vis.lastAngles[d.data.genre] = {
        startAngle: d.startAngle,
        endAngle: d.endAngle,
      };
    });
  }
}
