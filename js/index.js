// Uncomment the following line to reprocess data
//processData();

let movieData;
let actorToActor;
let actorToMovie;
let genreToActor;

let chordDiagram;

const initializeChordDiagram = data => {
  const getUid = (g, a) => g + "_" + a;

  const shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const nextGenre = n => {
    let aGenres = actorToGenre[n.name];
    let next = aGenres[(aGenres.findIndex(d => d === n.genre) + 1) % aGenres.length];
    let start = genres.findIndex(d => d === n.genre);
    let i = start;
    while (genres[i] !== next) {
      i = (i + 1) % genres.length;
    }
    if (i < start) {
      return i + genres.length - start;
    } else {
      return i - start;
    }
  }

  let nodes = [];
  let genres = [];
  let actorToGenre = {};
  shuffle(data.sort((a, b) => {
    return b.actors.length - a.actors.length;
  }).slice(0, 5)).forEach(d => {
    let genre = d.genre;
    genres.push(genre);
    d.actors.forEach(a => {
      nodes.push({genre: genre, name: a, uid: getUid(genre, a)});
      if (a in actorToGenre) {
        actorToGenre[a].push(genre);
      } else {
        actorToGenre[a] = [genre];
      }
    });
  });

  nodes.sort((a, b) => {
    if (a.genre === b.genre) {
      return nextGenre(b) - nextGenre(a);
    } else {
      return 0;
    }
  })

  nodes = nodes.filter(n => {
    return actorToGenre[n.name].length > 1;
  });

  let links = [];
  Object.entries(actorToGenre).forEach(([a, gs]) => {
    if (gs.length > 1) {
      gs.forEach((g, i) => {
        if (gs.length === 2 && i === 1) {
          return;
        }
        for (let j = i + 1; j < gs.length; j++) {
          let ng = gs[j];
          links.push({
            source: getUid(g, a),
            target: getUid(ng, a),
            type: getUid(g, ng)
          });
        }
      });
    }
  });

  chordDiagram = new ChordDiagram({
    parentElement: '#chord-diagram',
    containerWidth: 800,
    containerHeight: 800
  });

  chordDiagram.nodes = nodes;
  chordDiagram.genres = genres;
  chordDiagram.links = links;
  chordDiagram.aToG = actorToGenre;
  chordDiagram.selected = [];//["Action", "Drama"];

  chordDiagram.initVis();
  chordDiagram.render();
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

  //initializeChordDiagram(files[3]);
});
