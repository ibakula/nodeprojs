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

function main() {
  Main.start(author)
  .then(() => createPromiseForAllLinks())
  .then(responses => createLinksArray(responses))
  .then(links => Main.getArticle(links[0].postIdStr))
  .then(text => Main.searchForArticle(text))
  .then(response => { 
    if (!('data' in response) || 
      (!Array.isArray(response.data) && !('id' in response.data)) ||
      (Array.isArray(response.data) && response.data.length < 1)) {
      return;
    }
    
  })
  .catch(error => {
    console.error(error.message);
  });
}

main();
