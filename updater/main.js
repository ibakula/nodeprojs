const axios = require('axios');
const Main = require('./controller/program.js');

// This setting refers to minutes
const updateInterval = 1;

const author = {
  'email': 'test@test.com',
  'password': 'testing'
};

const links = {
 'https://www.bbc.com/news/business': 1,
 'https://www.bbc.com/news/technology': 2
};

function createPromiseForAllLinks() {
  let promises = [];
  for (const link in links) {
    promises.push(Main.fetchNewsData(link));
  }
  return Promise.all(promises);
}

function createLinksArray(responses) {
  let links = [];
  let sectionUrl = '';
  for (let response of responses) {
    links = links.concat(Main.extractLinks(response));
    if (sectionUrl.length == 0) {
      sectionUrl = response.config.url;
    }
  }
  return { 'links': links, 'url': sectionUrl };
}

function fetchArticles(links) {
  let promises = [];
  for (const link of links) {
    promises.push(Main.getArticle(link.postIdStr));
  }
  return Promise.all(promises);
}

function searchForArticles(textArr) {
  let promises = [];
  for (const textObj of textArr) {
    promises.push(Main.searchForArticle(textObj));
  }
  return Promise.all(promises);
}

function postArticles(responsesObj) {
  let promises = [];
  for (const response of responsesObj.responses) {
    if ((!Array.isArray(response.res.data) && 'id' in response.res.data) ||
      (Array.isArray(response.res.data) && response.res.data.length > 0)) {
      // Article already posted
      continue;
    }
    promises.push(Main.insertArticle(response.contentObj, links[responsesObj.url]));
  }
  return Promise.all(promises);
}

function main() {
  Main.start(author)
  .then(() => createPromiseForAllLinks())
  .then(responses => createLinksArray(responses))
  .then(linksObj => fetchArticles(linksObj.links)
    .then(textArr => ({ 'textArr': textArr, 'url': linksObj.url })))
  .then(textObj => searchForArticles(textObj.textArr)
    .then(responses => ({ 'responses': responses, 'url': textObj.url })))
  .then(postArticles)
  .then(responses => {
    setTimeout(() => { main(); }, (updateInterval*60*1000));
  })
  .catch(error => {
    console.error(error.message);
  });
}

main();
