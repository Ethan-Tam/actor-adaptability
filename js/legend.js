const initializeLegend = () => {
  let parentSvg = d3.select('svg#legend');

  let group = parentSvg.append('g')
      .attr('transform', 'translate(0, 10)');
  group.append('line')
      .attr('x1', 0)
      .attr('y1', 10)
      .attr('x2', 20)
      .attr('y2', 10)
      .attr('stroke-width', 1)
      .attr('stroke', 'lightgrey')
      .attr('fill', 'none')
  group.append('text')
      .attr('x', 30)
      .attr('y', 14)
      .text('actor has 1 movie in genre')

  group = parentSvg.append('g')
      .attr('transform', 'translate(0, 30)');
  group.append('line')
      .attr('x1', 0)
      .attr('y1', 10)
      .attr('x2', 20)
      .attr('y2', 10)
      .attr('stroke-width', 6)
      .attr('stroke', 'lightgrey')
      .attr('fill', 'none')
  group.append('text')
      .attr('x', 30)
      .attr('y', 14)
      .text('actor has 9 movies in genre')

  group = parentSvg.append('g')
      .attr('transform', 'translate(0, 50)');
  group.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 3)
      .attr('fill', 'grey')
  group.append('text')
      .attr('x', 30)
      .attr('y', 14)
      .text('actor has 1 movie total')

  group = parentSvg.append('g')
      .attr('transform', 'translate(0, 70)');
  group.append('circle')
      .attr('cx', 10)
      .attr('cy', 10)
      .attr('r', 7)
      .attr('fill', 'grey')
  group.append('text')
      .attr('x', 30)
      .attr('y', 14)
      .text('actor has 15 movies total')
}
