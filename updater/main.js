const axios = require('axios');
const Main = require('./controller/program.js');

const author = {
  'email': 'test@test.com',
  'password': 'testing'
};

const links = [
 'https://www.bbc.com/news/business',
 'https://www.bbc.com/news/technology'
];

function createPromiseForAllLinks() {
  let promises = [];
  for (const link of links) {
    promises.push(Main.fetchNewsData(link));
  }
  return Promise.all(promises);
}

function createLinksArray(responses) {
  let links = [];
  for (let response of responses) {
    links = links.concat(Main.extractLinks(response));
  }
  return links;
}

function fetchArticles(links) {
  let promises = [];
  for (const link of links) {
    promises.push(Main.getArticle(item.postIdStr));
  }
  return Promise.all(promises);
}

function searchForArticles(texts) {
  let promises = [];
  for (const text of texts) {
    promises.push(Main.searchForArticle(response.data));
  }
  return Promise.all(promises);
}

function main() {
  Main.start(author)
  .then(() => createPromiseForAllLinks())
  .then(responses => createLinksArray(responses))
  .then(links => fetchArticles(links))
  .then(texts => searchForArticles(texts))
  .then(responses => { 
    for (const response of responses) {
      if (!('data' in response) || 
        (!Array.isArray(response.data) && !('id' in response.data)) ||
        (Array.isArray(response.data) && response.data.length < 1)) {
        continue;
      }
      
    }
  })
  .catch(error => {
    console.error(error.message);
  });
}

main();
