// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToMovie;
let genreToActor;

let chordDiagram;

const initializeChordDiagram = data => {
  let nodes = [];
  let genres = []
  data.sort((a, b) => {
    return b.actors.length - a.actors.length;
  }).slice(0, 10).forEach(d => {
    let genre = d.genre;
    genres.push(genre);
    d.actors.split(',').forEach(a => {
      nodes.push({genre: genre, name: a, uid: genre + "_" + a});
    });
  });

  let links = [];

  chordDiagram = new ChordDiagram({
    parentElement: '#chord-diagram',
    containerWidth: 800,
    containerHeight: 800
  });

  chordDiagram.nodes = nodes;
  chordDiagram.genres = genres;
  chordDiagram.links = links;

  chordDiagram.initVis();
  chordDiagram.render();
};

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.csv('data/actor-to-actor.csv'),
  d3.csv('data/actor-to-movie.csv'),
  d3.csv('data/genre-to-actor.csv')
]).then(files => {
  movieData = d3.nest()
      .key(d => d["Title"])
      .map(files[0]);
  actorToActor = d3.nest()
      .key(d => d["actor"])
      .map(files[1]);
  actorToMovie = d3.nest()
      .key(d => d["actor"])
      .map(files[2]);
  genreToActor = d3.nest()
      .key(d => d["genre"])
      .map(files[3]);

  initializeChordDiagram(files[3]);
});
