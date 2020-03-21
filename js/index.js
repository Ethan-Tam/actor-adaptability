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

  let numGenres = 5;
  let topGenres = genreToActor.slice(0, numGenres);
  matrix = [];

  let keys = d3.range(5);
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

  network.genres = topGenres.map(g => g.genre);
  network.matrix = matrix;
  network.nodes = actorToGenre;
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
