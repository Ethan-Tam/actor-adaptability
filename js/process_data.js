// Load/parse/process datasets, set up callbacks etc.
const processData = () => {
  let genreToActors = {};
  let actorToMovies = {};
  let actorToActor = {};

  d3.csv('data/movie-data.csv').then(data => {
    // Parse data into separate dicts
    data.forEach(d => {
      // Everything has to do with actors, so make them the outer loop
      d['Actors'].split(',').forEach(a => {
        // Trim the name to remove spaces before and after
        let name = a.trim();

        // Handle the genre to actor dict
        d['Genre'].split(',').forEach(g => {
          if (!(g in genreToActors)) {
            genreToActors[g] = [];
          }
          if (!genreToActors[g].includes(name)) {
            genreToActors[g].push(name);
          }
        });

        // Handle the actor to movie dict
        if (!(name in actorToMovies)) {
          actorToMovies[name] = [d['Title']];
        } else {
          actorToMovies[name].push(d['Title']);
        }

        // Handle the actor to actor dict
        if (!(name in actorToActor)) {
          actorToActor[name] = [];
        }
        d['Actors'].split(',').forEach(o => {
          let otherName = o.trim();
          if (name !== otherName && !actorToActor[name].includes(otherName)) {
            actorToActor[name].push(otherName);
          }
        });
      });
    });

    // Convert the dicts to arrays
    let gToARows = [];
    let aToMRows = [];
    let aToARows = [];

    Object.entries(genreToActors).forEach(([k, v]) => {
      let row = [k, v.join(',')];
      gToARows.push(row);
    });
    gToARows.sort((a, b) => {
      return b[1].length - a[1].length
    });

    Object.entries(actorToMovies).forEach(([k, v]) => {
      let row = [k, v.join(',')];
      aToMRows.push(row);
    });
    aToMRows.sort((a, b) => {
      return b[1].length - a[1].length
    });

    Object.entries(actorToActor).forEach(([k, v]) => {
      let row = [k, v.join(',')];
      aToARows.push(row);
    });
    aToARows.sort((a, b) => {
      return b[1].length - a[1].length
    });

    // Convert the arrays to CSV strings
    let gToACsvContent = 'genre,actors\n' + gToARows.map(e => e.map(s => '"' + s + '"').join(',')).join('\n');
    let aToMCsvContent = 'actor,movies\n' + aToMRows.map(e => e.map(s => '"' + s + '"').join(',')).join('\n');
    let aToACsvContent = 'actor,actors\n' + aToARows.map(e => e.map(s => '"' + s + '"').join(',')).join('\n');

    // Log the strings so they can be pasted into CSV files
    console.log(gToACsvContent);
    console.log(aToMCsvContent);
    console.log(aToACsvContent);
  });
}
