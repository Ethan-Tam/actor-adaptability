// Uncomment the following line to reprocess data
//processData();

// Data
let movieData;
let actorToGenre;
let genreToActor;
let actorLinks;
let actorYearGenres;
let genres;
let genreCountMap

// Views
let network;
let piechart;
let barchart;

// Constants
let selectStrokeWidth = 1;
let numGenres = 7;
let transitionTime = 300;
const fullOpacity = 1;
const fadeOpacity = 0.3;

// Common colour scale
let colourScale;

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.json('data/actor-to-genres.json'),
  d3.json('data/genre-to-actors.json'),
  d3.json('data/actor-links.json'),
  d3.json('data/actor-to-year-genres.json'),
]).then((files) => {
  movieData = files[0];
  actorToGenre = files[1];
  genreToActor = files[2];
  actorLinks = files[3];
  actorYearGenres = files[4];

  // Compute "Other" category
  topGenres = genreToActor.slice(0, numGenres - 1);
  let other = [];
  genreToActor.slice(numGenres - 1, genreToActor.length).forEach((d) => {
    other.push(...d.actors);
  });
  other = Array.from(new Set(other));
  topGenres.push({ genre: 'Other', actors: other });

  genres = topGenres.map((g) => g.genre);
  actorToGenre.forEach((d) => {
    let otherCount = d.genres
      .filter((g) => !genres.includes(g.genre))
      .reduce((acc, cv) => acc + cv.count, 0);
    d.genres = d.genres.filter((g) => genres.includes(g.genre));
    if (otherCount > 0) d.genres.push({ genre: 'Other', count: otherCount });
  });

  let genreCount = {};
  genres.forEach(d => {
    genreCount[d] = 0;
  })
  // Creates a total movie genre count mapping
  movieData.forEach(d => {
    movieGenre = d.Genre.split(',')[0];
    if (movieGenre in genreCount) {
      genreCount[movieGenre] += 1;
    } else {
      genreCount.Other += 1;
    }
  });

  // converts genreCount to an array of objects
  genreCountMap = Object.entries(genreCount).map(([k, v]) => {
    return { genre: k, count: v };
  });
  // Create genre index map
  genreMap = {};
  genres.forEach((g, i) => {
    genreMap[g] = i;
  });

  // Creates actor map for search bar
  actorMap = {};
  actorToGenre.forEach((g) => {
    actorMap[g.actor.toLowerCase()] = g;
  });

  // Create colour scale
  colourScale = d3.scaleOrdinal(d3.schemeTableau10).domain(genres);

  // Initialize views
  initializeLegend();
  initializeNetwork();
  initializePieChart();
  initializeBarchart();
});

// Hover callback functions
let hovered = null;

const hoverSlice = (slice) => {
  piechart.hoveredSlice = slice;
  piechart.hoveredGenre = slice == null ? null : slice.data.genre;
  piechart.saveLastAngles();
  piechart.render();
};

const hover = (s) => {
  network.hovered = s;
  network.render();
};

// Click callback function
let selectedActor = null;
let selectedGenre = null;

const selectSlice = (s) => {
  if (s === null) {
    selectedActor = null;
    selectedGenre = null;
  } else {
    selectedGenre = s.data.genre == selectedGenre ? null : s.data.genre;
  }
  network.selectedGenre = selectedGenre;
  network.render();
  piechart.selectedGenre = selectedGenre;
  piechart.saveLastAngles();
  piechart.update();
  barchart.selectedGenre = selectedGenre;
  barchart.update();
};

const select = (s) => {
  if (s === null) {
    selectedActor = null;
    selectedGenre = null;
  } else {
    if (genres.includes(s)) {
      selectedGenre = s === selectedGenre ? null : s;
      selectedActor = null;
    } else {
      selectedActor = s === selectedActor ? null : s;
      selectedGenre = null;
    }
  }

  network.selectedActor = selectedActor;
  network.selectedGenre = selectedGenre;
  piechart.selectedActor = selectedActor;
  network.render();
  piechart.selectedGenre = selectedGenre;
  piechart.saveLastAngles();
  piechart.update();
  barchart.selectedActor = selectedActor;
  barchart.selectedGenre = selectedGenre;
  barchart.update();
};

// Count common elements
const countDuplicates = (l1, l2) => {
  let count = 0;
  l1.forEach((ai) => {
    l2.forEach((aj) => {
      if (ai === aj) count++;
    });
  });
  return count;
};

// Initialize network actor view
const initializeNetwork = () => {
  // Make matrix for chord diaram ring
  let matrix = [];
  let keys = d3.range(numGenres);
  keys.forEach((i) => {
    let row = [];
    keys.forEach((j) => {
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
  network.links = actorLinks;
  network.fullOpacity = fullOpacity;
  network.fadeOpacity = fadeOpacity;
  network.transitionTime = transitionTime;

  network.initVis();

  // implements search bar functionality
  $(() => {
    // selects a node if the actor exists and it not already selected
    const submitSearch = () => {
      searchValue = $('#actor-search').val().toLowerCase();
      if (
        searchValue.trim() in actorMap &&
        selectedActor != actorMap[searchValue]
      ) {
        select(actorMap[searchValue]);
      }
    };
    // creates an array of actor names used for autocomplete
    let actorNames = actorToGenre.map((d) => {
      return d.actor;
    });
    $('#actor-search').autocomplete({
      source: actorNames,
    });
    $('#actor-submit').click(submitSearch);
    // searches an actor if the enter button is pressed
    $('#actor-search').keypress((event) => {
      const keycode = event.keyCode ? event.keyCode : event.which;
      if (keycode == '13') {
        submitSearch();
      }
    });
  });
};

// Initialize pie chart view
const initializePieChart = () => {
  piechart = new PieChart({
    parentElement: '#pie-chart',
    containerWidth: 400,
    containerHeight: 400,
  });

  piechart.initialData = genreCountMap;
  piechart.colourScale = colourScale;
  piechart.genres = genres;
  piechart.genreMap = genreMap;
  piechart.fullOpacity = fullOpacity;
  piechart.fadeOpacity = fadeOpacity;
  piechart.transitionTime = transitionTime;
  piechart.hover = hoverSlice;
  piechart.select = selectSlice;
  piechart.dataType = 'count';

  piechart.initVis();

  // radio button events
  $('#radio-selector').on('change', () => {
    dataType = $("input[name='data']:checked").val();
    piechart.dataType = dataType;
    piechart.renderLabels();
  });
};

// Initialize bar chart view
const initializeBarchart = (data) => {
  barchart = new stackedBarChart({
    parentElement: '#stacked-bar-chart',
    containerWidth: 400,
    containerHeight: 400,
  });

  // Compute other stuff
  topGenresObj = genreToActor.slice(0, numGenres - 1);
  topGenres = [];
  topGenresObj.forEach((genreObj) => {
    topGenres.push(genreObj['genre']);
  });

  // go through actor-to-genre-year, eliminate nontop genres, add "other" genre
  // for each actor in array
  Object.entries(actorYearGenres).forEach(([key, val]) => {
    // for each "year object" in array
    val.forEach((yearObj) => {
      // add all genres not in topGenres to yearObj with count = 0
      topGenres.forEach((genre) => {
        if (!yearObj.hasOwnProperty(genre)) {
          // if yearObj doesn't have one of the top genres, add it with count = 0
          yearObj[genre] = 0;
        }
      });
      // go through each key that isn't year, if it's not in topGenres, add count to an "other" key
      otherCount = 0;
      Object.keys(yearObj).forEach((key) => {
        if (key !== 'year' && !topGenres.includes(key)) {
          otherCount += yearObj[key];
          // get rid of the nontop genre key value pair
          delete yearObj[key];
        }
      });
      // add the "Other" genre with the count of all the nontop genres
      yearObj['Other'] = otherCount;
    });
  });

  // add "Other" to top genres
  topGenres.push('Other');

  // create top genre data from "all" data
  topGenres.forEach((genre) => {
    actorYearGenres[genre] = [
      { year: 2006 },
      { year: 2007 },
      { year: 2008 },
      { year: 2009 },
      { year: 2010 },
      { year: 2011 },
      { year: 2012 },
      { year: 2013 },
      { year: 2014 },
      { year: 2015 },
      { year: 2016 },
    ];
  });

  // fill in the counts for each genre entity
  actorYearGenres['all'].forEach((yearObj, index) => {
    Object.entries(yearObj).forEach(([genre, count]) => {
      if (genre !== 'year') {
        // fill in genre with its count
        actorYearGenres[genre][index][genre] = count;
        // fill in all other genres with count = 0
        topGenres.forEach((genre2) => {
          if (genre2 !== genre) {
            actorYearGenres[genre][index][genre2] = 0;
          }
        });
      }
    });
  });

  // finally, add a "columns" property to data with the top genres
  actorYearGenres['columns'] = topGenres;

  barchart.data = actorYearGenres;
  barchart.colourScale = colourScale;
  barchart.selectedActor = null;
  barchart.selectedGenre = null;
  barchart.transitionTime = transitionTime;

  barchart.initVis();
};
