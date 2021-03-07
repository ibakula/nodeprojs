const axios = require('axios');
const Main = require('./controller/program.js');

// This sets the script's sequence update interval
// Expression is in minutes
const updateInterval = 60;

const author = {
  'email': 'test@test.com',
  'password': 'testing'
};

const links = {
  // Science category
  'https://www.bbc.com/news/science_and_environment': 1,
  'https://news.yahoo.com/science': 1,
  'https://www.reuters.com/lifestyle/science': 1,
  'https://news.yahoo.com/science': 1,
  // Business category
  'https://www.bbc.com/news/business': 2,
  'https://news.yahoo.com/business': 2,
  'https://www.reuters.com/business': 2,
  // Worldwide news category
  'https://www.bbc.com/news/world': 3,
  'https://news.yahoo.com/world': 3,
  'https://www.reuters.com/world': 3,
  // Sports section
  'https://www.reuters.com/lifestyle/sports': 4,
  'https://www.nbcsports.com/soccer': 4,
  'https://www.nbcsports.com/nascar': 4,
  'https://www.nbcsports.com/tennis': 4,
  'https://www.nbcsports.com/nba': 4,
  'https://www.nbcsports.com/motors': 4,
  'https://www.nbcsports.com/nfl': 4,
  'https://www.nbcsports.com/nhl': 4,
  // Politics category
  'https://www.bbc.com/news/politics': 5,
  'https://news.yahoo.com/politics': 5,
  'https://www.reuters.com/world/us-politics': 5,
  // Tech category
  'https://www.bbc.com/news/technology': 6,
  'https://www.reuters.com/technology': 6
};

function createPromiseForAllLinks() {
  let promises = [];
  for (const link in links) {
    promises.push(Main.fetchNewsData(link).catch(err => err));
  }
  return Promise.all(promises);
}

function createLinksArray(responses) {
  let linksObjArr = [];
  for (let response of responses) {
    if (response instanceof Error) {
      console.error("Skipping fetching section's latest news.");
      console.error(response.message);
      continue;
    }
    linksObjArr.push({ 'links': Main.extractLinks(response), 'url': response.config.url });
  }
  return linksObjArr;
}

function fetchArticles(linksArr) {
  let promises = [];
  for (const item of linksArr) {
    for (const link of item.links) {
      promises.push(Main.getArticle(link.postIdStr).then(textObj => ({ 'textObj': textObj, 'url': item.url })).catch(err => err));
    }
  }
  return Promise.all(promises);
}

function searchForArticles(textArr) {
  let promises = [];
  for (const item of textArr) {
    if (item instanceof Error) {
      console.error("Article read error, skipping..");
      console.error(item.message);
      continue;
    }
    promises.push(Main.searchForArticle(item.textObj).then(responseObj => ({ 'responseObj': responseObj, 'url': item.url })).catch(err => err));
  }
  return Promise.all(promises);
}

function postArticles(responsesArr) {
  let promises = [];
  for (const item of responsesArr) {
    if (item instanceof Error) {
      console.error("Skipping article due to occured errors.");
      console.error(response.message);
      continue;
    }
    if ((!Array.isArray(item.responseObj.res.data) && 'id' in item.responseObj.res.data) ||
      (Array.isArray(item.responseObj.res.data) && item.responseObj.res.data.length > 0)) {
      // Article already posted
      continue;
    }
    console.log(links[item.url] + ": " + item.url);
    promises.push(Main.insertArticle(item.responseObj.contentObj, links[item.url]).catch(err => err));
  }
  return Promise.all(promises);
}

function main() {
  Main.start(author)
  .then(() => createPromiseForAllLinks())
  .then(responses => createLinksArray(responses))
  .then(linksObjArr => fetchArticles(linksObjArr))
  .then(textArr => searchForArticles(textArr))
  .then(postArticles)
  .then(responses => {
    for (const response of responses) {
      if (response instanceof Error) {
        console.error("Skipped posting an article due to errors...");
        console.error(response.message);
      }
    }
    setTimeout(() => { main(); }, (updateInterval*60*1000));
  })
  .catch(error => {
    console.error(error);
  });
}

main();
