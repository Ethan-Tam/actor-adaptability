// Uncomment the following line to reprocess data
// processData();

let movieData;
let actorToActor;
let actorToGenre;
let genreToActor;
let actorLinks;
let actorYearGenres;

let network;
let piechart;
let barchart;

let selectStrokeWidth = 1;
let numGenres = 7;
let genres;

const fullOpacity = 1;
const fadeOpacity = 0.3;

let colourScale;

Promise.all([
  d3.csv('data/movie-data.csv'),
  d3.json('data/actor-to-actors.json'),
  d3.json('data/actor-to-genres.json'),
  d3.json('data/genre-to-actors.json'),
  d3.json('data/actor-links.json'),
  d3.json('data/actor-to-year-genres.json')
]).then(files => {
  moveData = files[0];
  actorToActor = files[1];
  actorToGenre = files[2];
  genreToActor = files[3];
  actorLinks = files[4];
  actorYearGenres = files[5];

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
  initializeBarchart(files[5]);
});

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
  piechart.selected = selectedActor;
  network.render();
  piechart.saveLastAngles();
  piechart.update();
  barchart.selectedActor = selectedActor;
  barchart.selectedGenre = selectedGenre;
  barchart.update();
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
  network.links = actorLinks;
  network.fullOpacity = fullOpacity;
  network.fadeOpacity = fadeOpacity;

  network.initVis();
};

const initializeBarchart = data => {

  barchart = new stackedBarChart({
    parentElement: '#stacked-bar-chart',
    containerWidth: 400,
    containerHeight: 400
  });

  // Compute other stuff
  topGenresObj = genreToActor.slice(0, numGenres - 1);
  topGenres = []
  topGenresObj.forEach((genreObj) => {
    topGenres.push(genreObj["genre"])
  });
  // console.log(topGenres)

  // go through actor-to-genre-year, eliminate nontop genres, add "other" genre
  // for each actor in array
  Object.entries(data).forEach(([key, val]) => {
    // for each "year object" in array
    val.forEach((yearObj) => {
      // add all genres not in topGenres to yearObj with count = 0
      topGenres.forEach((genre) => {
        if (!yearObj.hasOwnProperty(genre)) {
          // if yearObj doesn't have one of the top genres, add it with count = 0
          yearObj[genre] = 0
        }
      });
      // go through each key that isn't year, if it's not in topGenres, add count to an "other" key
      otherCount = 0
      Object.keys(yearObj).forEach((key) => {
        if (key !== "year" && !topGenres.includes(key)) {
          otherCount += yearObj[key]
          // get rid of the nontop genre key value pair
          delete yearObj[key]
        }
      });
      // add the "Other" genre with the count of all the nontop genres
      yearObj["Other"] = otherCount
    });
  });

  // add "Other" to top genres
  topGenres.push("Other")

  // create top genre data from "all" data
  topGenres.forEach((genre) => {
    data[genre] = [{year: 2006},{year: 2007},{year: 2008},{year: 2009},{year: 2010},{year: 2011},
                                  {year: 2012},{year: 2013},{year: 2014},{year: 2015},{year: 2016}];
  });

  // fill in the counts for each genre entity
  data["all"].forEach((yearObj, index) => {
    Object.entries(yearObj).forEach(([genre, count]) => {
      if (genre !== "year") {
        // fill in genre with its count
        data[genre][index][genre] = count
        // fill in all other genres with count = 0
        topGenres.forEach((genre2) => {
          if (genre2 !== genre) {
            data[genre][index][genre2] = 0
          }
        });
      }
    });
  });

  // finally, add a "columns" property to data with the top genres
  data["columns"] = topGenres

  // console.log(data)

  barchart.data = data;
  barchart.colourScale = colourScale;
  // console.log(data["all"])
  // console.log(d3.stack().keys(barchart.data["columns"].slice(1))(barchart.data["all"]))

  barchart.initVis();
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
