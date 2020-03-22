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
    vis.render();
  }

  render() {
    let vis = this;
    let data;
    if (vis.selected == null) {
      data = d3
        .pie()
        .sort(null)
        .value(d => d.actors.length)(vis.initialData);
      vis.labels = vis.chart
        .selectAll('text')
        .data(data)
        .join('text')
        .text('All Actors')
        .attr('transform', `translate(${-32},${-130})`);
    } else {
      data = d3
        .pie()
        .sort(null)
        .value(d => d.count)(vis.selected.genres);
      vis.labels = vis.chart
        .selectAll('text')
        .data(data)
        .join('text')
        .text(vis.selected.actor)
        .attr(
          'transform',
          `translate(${-vis.selected.actor.length * 4},${-130})`,
        );
    }
    let segments = d3
      .arc()
      .innerRadius(0)
      .outerRadius(100);
    vis.chart
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', segments)
      .attr('fill', d => vis.colourScale(d.data.genre));
  }
}
