// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToMovie;
let genreToActor;

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
});
