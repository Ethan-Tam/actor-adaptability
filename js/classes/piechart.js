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
      vis.data = d3
        .pie()
        .value(d => d.count)
        .sort((a, b) => vis.genreMap[a.genre] - vis.genreMap[b.genre])(
        vis.selected.genres,
      );
      vis.title = vis.selected.actor;
    }
    vis.render();
  }

  render() {
    let vis = this;
    let segments = d3
      .arc()
      .innerRadius(0)
      .outerRadius(100);

    // Adds title to piechart
    vis.chart
      .selectAll('text')
      .data(vis.data)
      .join('text')
      .text(vis.title)
      .attr(
        'transform',
        `translate(${-vis.title.length * 4},${-130})`,
      );

    vis.chart
      .selectAll('path')
      .data(vis.data)
      .join('path')
      .attr('d', segments)
      .attr('fill', d => vis.colourScale(d.data.genre));
  }
}
