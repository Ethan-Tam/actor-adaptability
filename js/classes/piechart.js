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

    // calculates the midpoint of the slice
    vis.midAngle = d => {
      if (d.endAngle == d.startAngle) {
        return 0;
      }
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    };

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
      .attr(
        'transform',
        `translate(${- vis.config.containerWidth / 2},${-vis.config
          .containerHeight / 2})`,
      )
      .on('click', () => vis.select(null));

    // initialize svg group elements
    vis.chart.append('g').attr('class', 'label');
    vis.chart.append('g').attr('class', 'lines');
    vis.chart.append('g').attr('class', 'title');

    // Initialize previous angles all to zero
    vis.lastAngles = {};
    vis.genres.forEach(d => {
      vis.lastAngles[d] = { startAngle: 0, endAngle: 0 };
    });

    vis.update();
  }

  update() {
    let vis = this;
    if (vis.selectedActor == null) {
      vis.data = d3
        .pie()
        .value(d => d.actors.length)
        .sort(null)(vis.initialData);
      vis.title = 'All Actors';
    } else {
      // Add all the unincluded genres with count zero
      let genreData = [...vis.selectedActor.genres];
      genreData.push(
        ...vis.genres
          .filter(d => {
            return !vis.selectedActor.genres.map(g => g.genre).includes(d);
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
      vis.title = vis.selectedActor.actor;
    }

    vis.polyline = vis.chart
      .select('.lines')
      .selectAll('polyline')
      .data(vis.data);

    vis.labels = vis.chart
      .select('.label')
      .selectAll('text')
      .data(vis.data);

    // adds data labels to pie chart
    vis.labels
      .join('text')
      .attr('transform', d => {
        const pos = vis.expandedSegments.centroid(d);
        pos[0] = 100 * (vis.midAngle(d) < Math.PI ? 1 : -1);
        const xMultiplier = pos[0] > 0 ? 1.55 : 1.75;
        return 'translate(' + [pos[0] * xMultiplier, pos[1] * 2] + ')';
      })
      .text(d => {
        if (d.value > 0) {
          return d.value;
        }
      })
      .attr('font-size', 12);

    // adds polylines to pie chart
    vis.polyline.join('polyline').attr('points', d => {
      const pos = vis.expandedSegments.centroid(d);
      const midAngle = vis.midAngle(d);
      // only create a polyline if the value is greater than 0
      if (midAngle > 0) {
        pos[0] = 100 * (vis.midAngle(d) < Math.PI ? 1 : -1);
        return [
          vis.segments.centroid(d).map(n => n * 2),
          vis.expandedSegments.centroid(d).map(n => n * 2),
          [pos[0] * 1.5, pos[1] * 2],
        ];
      }
    });

    vis.render();
  }

  render() {
    let vis = this;

    // Adds title to piechart
    vis.chart
      .select('.title')
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
      .on('click', d => {
        vis.select(d);
      })
      .on('mouseover', d => {
        vis.hover(d);
      })
      .on('mouseout', () => {
        vis.hover(null);
      });

    // select/hover effects on the pie chart
    vis.slices
      .attr('stroke', 'black')
      .attr('stroke-width', d => (d.data.genre == vis.hoveredGenre? 1 : 0))
      .attr('opacity', d => {
        if (vis.selectedGenre == null || d.data.genre == vis.selectedGenre) {
          return vis.fullOpacity;
        }
        return vis.fadeOpacity;
      })
      .transition()
      .duration(vis.transitionTime)
      .attrTween('d', d => {
        if (d.data.genre == vis.hoveredGenre) {
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
