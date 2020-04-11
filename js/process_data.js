// Load/parse/process datasets, set up callbacks etc.
const processData = () => {
  let genreToActors = {};
  let actorToGenres = {};
  let actorToActor = {};
  let actorToYearGenre = {};
  let actorToGenreCount = {};
  // initialize actorToYearGenre with "all" object
  actorToYearGenre["all"] = [{year: 2006},{year: 2007},{year: 2008},{year: 2009},{year: 2010},{year: 2011},
                                  {year: 2012},{year: 2013},{year: 2014},{year: 2015},{year: 2016}];
  actorToGenreCount["all"] = makeGenreCountRow("All Genres");

  d3.csv('data/movie-data.csv').then(data => {
    // Parse data into separate dicts
    data.forEach(d => {
      // Get d's "main" genre
      g = d['Genre'].split(',')[0]
      let index = +d['Year']-2006
      // Deal with actorToYearGenre for "all"
      if (actorToYearGenre["all"][index].hasOwnProperty(g)) {
          actorToYearGenre["all"][index][g]++;
        } else {
          actorToYearGenre["all"][index][g] = 1;
        }
      // Deal with actorToGenreCount for "all"
      addOrIncrementSeriesValues(actorToGenreCount, index, g, "all");
      // Deal with actorToGenreCount for genres
      if (!(g in actorToGenreCount)) {
          actorToGenreCount[g] = makeGenreCountRow(g);
        }
      addOrIncrementSeriesValues(actorToGenreCount, index, g, g);

      // Everything has to do with actors, so make them the outer loop
      d['Actors'].split(',').forEach(a => {
        // Trim the name to remove spaces before and after
        let name = a.trim();

        // Handle the genre to actor dict
        if (!(g in genreToActors)) {
          genreToActors[g] = [];
        }
        if (!genreToActors[g].includes(name)) {
          genreToActors[g].push(name);
        }

        // Handle the actor to genre dict
        if (!(name in actorToGenres)) {
          actorToGenres[name] = [{genre: g, count: 1}];
        } else {
          let isNew = true;
          actorToGenres[name].forEach(t => {
            if (t.genre === g) {
              t.count++;
              isNew = false;
            }
          });
          if (isNew)
            actorToGenres[name].push({genre: g, count: 1});
        }

        // Handle the actor to actor dict
        if (!(name in actorToActor)) {
          actorToActor[name] = [];
        }
        d['Actors'].split(',').forEach(o => {
          let otherName = o.trim();
          if (name !== otherName) {
            let isNew = true;
            actorToActor[name].forEach(t => {
              if (t.name === otherName) {
                t.count++;
                isNew = false;
              }
            });
            if (isNew)
              actorToActor[name].push({name: otherName, count: 1});
          }
        });

        // Handle the actor to genre-year dict
        if (!(name in actorToYearGenre)) {
          actorToYearGenre[name] = [{year: 2006},{year: 2007},{year: 2008},{year: 2009},{year: 2010},{year: 2011},
                                  {year: 2012},{year: 2013},{year: 2014},{year: 2015},{year: 2016}];
        }
        if (actorToYearGenre[name][index].hasOwnProperty(g)) {
          actorToYearGenre[name][index][g]++;
        } else {
          actorToYearGenre[name][index][g] = 1;
        }

        // Handle the actor to genre-count dict
        if (!(name in actorToGenreCount)) {
          actorToGenreCount[name] = makeGenreCountRow(name);
        }
        addOrIncrementSeriesValues(actorToGenreCount, index, g, name);
      });
    });

    // Convert the dicts to arrays
    let gToARows = [];
    let aToGRows = [];
    let aToARows = [];

    Object.entries(genreToActors).forEach(([k, v]) => {
      let row = {genre: k, actors: v};
      gToARows.push(row);
    });
    gToARows.sort((a, b) => {
      return b.actors.length - a.actors.length
    });

    Object.entries(actorToGenres).forEach(([k, v]) => {
      let row = {actor: k, genres: v};
      aToGRows.push(row);
    });
    aToGRows.sort((a, b) => {
      return b.genres.length - a.genres.length
    });

    Object.entries(actorToActor).forEach(([k, v]) => {
      v.sort((a, b) => {
        return b.count - a.count;
      });
      let row = {actor: k, actors: v};
      aToARows.push(row);
    });
    aToARows.sort((a, b) => {
      return b.actors.length - a.actors.length
    });

    // Log the strings so they can be pasted into CSV files
    // console.log(JSON.stringify(gToARows));
    // console.log(JSON.stringify(aToGRows));
    // console.log(JSON.stringify(aToARows));
    // console.log(actorToYearGenre);
    // console.log(actorToGenreCount);
  });
}

// Helper function to add a series row or increment the correct count
function addOrIncrementSeriesValues(actorToGenreCount, yearIndex, g, entityName) {
  let seriesIdx = actorToGenreCount[entityName]["series"].map(row => row["name"]).indexOf(g);
  if (seriesIdx == -1) {
    // if row doesn't exist yet, push row to seires
    actorToGenreCount[entityName]["series"].push(makeSeriesRow(g, yearIndex));
  } else {
    // else increment correct year of existing row
    actorToGenreCount[entityName]["series"][seriesIdx]["values"][yearIndex]++;
  }
}

// Simple helper to create genre count row with y = entityName
function makeGenreCountRow(entityName) {
  return {y: entityName, 
          series: [],
          dates: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016]};
}

// Simple helper to create series row with given genrename and 1 at given yearIndex
function makeSeriesRow(genreName, yearIndex) {
  let row = {name: genreName, values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};
  row["values"][yearIndex] = 1;
  return row;
}
