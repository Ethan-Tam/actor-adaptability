// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToMovie;
let genreToActor;

let chordDiagram;
let matrix;

let hoveredGenre = null;
const hover = genre => {
  chordDiagram.hovered = genre;
  chordDiagram.render();
};

let selectedGenre = null;
const select = genre => {
  selectedGenre = genre === selectedGenre ? null : genre;
  chordDiagram.selected = selectedGenre;
  chordDiagram.render();
};

const initializeChordDiagram = data => {
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

  chordDiagram = new ChordDiagram({
    parentElement: '#chord-diagram',
    containerWidth: 800,
    containerHeight: 800
  });

  chordDiagram.genres = topGenres.map(g => g.genre);
  chordDiagram.matrix = matrix;
  chordDiagram.hover = hover;
  chordDiagram.hovered = null;
  chordDiagram.select = select;
  chordDiagram.selected = null;

  chordDiagram.initVis();
};

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.json('data/actor-to-actors.json'),
  d3.json('data/actor-to-genres.json'),
  d3.json('data/genre-to-actors.json')
]).then(files => {
  moveData = files[0];
  actorToActor = files[1];
  actorToMovie = files[2];
  genreToActor = files[3];

  initializeChordDiagram(files[3]);
});
