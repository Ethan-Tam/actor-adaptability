// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToGenre;
let genreToActor;
let actorLinks;

let network;
let piechart;

let selectColour = 'hotpink';
let numGenres = 7;
let genres;

const fullOpacity = 1;
const fadeOpacity = 0.3;

let colourScale;

let hovered = null;

const hoverSlice = slice => {
  piechart.hoveredSlice = slice;
  piechart.saveLastAngles();
  piechart.render();
};

const hover = s => {
  network.hovered = s;
  network.render();
};

let selectedActor = null;
let selectedGenre = null;
const select = s => {
  if (s === null) {
    selectedActor = null;
    selectedGenre = null;
  } else {
    if (genres.includes(s)) selectedGenre = s === selectedGenre ? null : s;
    else selectedActor = s === selectedActor ? null : s;
  }
  network.selectedActor = selectedActor;
  network.selectedGenre = selectedGenre;
  piechart.selected = selectedActor;
  network.render();
  piechart.saveLastAngles();
  piechart.update();
};

const countDuplicates = (l1, l2) => {
  let count = 0;
  l1.forEach(ai => {
    l2.forEach(aj => {
      if (ai === aj) count++;
    });
  });
  return count;
};

const initializeNetwork = data => {
  let matrix = [];
  let keys = d3.range(numGenres);
  keys.forEach(i => {
    let row = [];
    keys.forEach(j => {
      if (j === i) row.push(0);
      else row.push(countDuplicates(topGenres[i].actors, topGenres[j].actors));
    });
    matrix.push(row);
  });

  network = new Network({
    parentElement: '#network',
    containerWidth: 800,
    containerHeight: 800,
  });

  network.colourScale = colourScale;
  network.genres = genres;
  network.genreMap = genreMap;
  network.matrix = matrix;
  network.nodes = actorToGenre;
  network.hover = hover;
  network.hovered = null;
  network.select = select;
  network.selectedActor = null;
  network.selectedGenre = null;
  network.selectColour = selectColour;
  network.links = actorLinks;
  network.fullOpacity = fullOpacity;
  network.fadeOpacity = fadeOpacity;

  network.initVis();
};

const initializePieChart = data => {
  piechart = new PieChart({
    parentElement: '#pie-chart',
    containerWidth: 400,
    containerHeight: 400,
  });
  piechart.initialData = data;
  piechart.colourScale = colourScale;
  piechart.genres = genres;
  piechart.genreMap = genreMap;
  piechart.fullOpacity = fullOpacity;
  piechart.fadeOpacity = fadeOpacity;
  piechart.hover = hoverSlice;
  piechart.initVis();
};

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.json('data/actor-to-actors.json'),
  d3.json('data/actor-to-genres.json'),
  d3.json('data/genre-to-actors.json'),
  d3.json('data/actor-links.json'),
]).then(files => {
  moveData = files[0];
  actorToActor = files[1];
  actorToGenre = files[2];
  genreToActor = files[3];
  actorLinks = files[4];

  // Compute "Other" category
  topGenres = genreToActor.slice(0, numGenres - 1);
  let other = [];
  genreToActor.slice(numGenres - 1, genreToActor.length).forEach(d => {
    other.push(...d.actors);
  });
  other = Array.from(new Set(other));
  topGenres.push({ genre: 'Other', actors: other });

  genres = topGenres.map(g => g.genre);
  actorToGenre.forEach(d => {
    let otherCount = d.genres
      .filter(g => !genres.includes(g.genre))
      .reduce((acc, cv) => acc + cv.count, 0);
    d.genres = d.genres.filter(g => genres.includes(g.genre));
    if (otherCount > 0) d.genres.push({ genre: 'Other', count: otherCount });
  });

  // Create genre index map
  genreMap = {};
  genres.forEach((g, i) => {
    genreMap[g] = i;
  });

  // Create colour scale
  colourScale = d3.scaleOrdinal(d3.schemeTableau10).domain(genres);

  initializeNetwork(files[3]);
  initializePieChart(topGenres);
});
