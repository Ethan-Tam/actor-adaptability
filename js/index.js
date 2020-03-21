// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToGenre;
let genreToActor;

let network;
let matrix;

let hovered = null;
const hover = s => {
  network.hovered = s;
  network.render();
};

let selected = null;
const select = s => {
  selected = s === selected ? null : s;
  network.selected = selected;
  network.render();
};

const initializeNetwork = data => {
  const countDuplicates = (l1, l2) => {
    let count = 0;
    l1.forEach(ai => {
      l2.forEach(aj => {
        if (ai === aj)
          count++;
      });
    });
    return count;
  };

  let numGenres = 6;
  let topGenres = genreToActor.slice(0, numGenres);
  let other = [];
  genreToActor.slice(numGenres, genreToActor.length).forEach(d => {
    other.push(...d.actors);
  });
  other = Array.from(new Set(other));
  topGenres.push({ genre: "Other", actors: other });
  matrix = [];

  numGenres++;
  let keys = d3.range(numGenres);
  keys.forEach(i => {
    let row = [];
    keys.forEach(j => {
      if (j === i)
        row.push(0);
      else
        row.push(countDuplicates(topGenres[i].actors, topGenres[j].actors));
    });
    matrix.push(row);
  });

  network = new Network({
    parentElement: '#network',
    containerWidth: 800,
    containerHeight: 800
  });

  let genres = topGenres.map(g => g.genre);
  let actors = actorToGenre;
  actors.forEach(d => {
    let otherCount = d.genres.filter(g => !genres.includes(g.genre))
                             .reduce((acc, cv) => acc + cv.count, 0);
    d.genres = d.genres.filter(g => genres.includes(g.genre));
    if (otherCount > 0)
      d.genres.push({ genre: "Other", count: otherCount });
  });

  network.genres = genres;
  network.matrix = matrix;
  network.nodes = actors;
  network.hover = hover;
  network.hovered = null;
  network.select = select;
  network.selected = null;

  network.initVis();
};

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.json('data/actor-to-actors.json'),
  d3.json('data/actor-to-genres.json'),
  d3.json('data/genre-to-actors.json')
]).then(files => {
  moveData = files[0];
  actorToActor = files[1];
  actorToGenre = files[2];
  genreToActor = files[3];

  initializeNetwork(files[3]);
});
