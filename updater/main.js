const axios = require('axios');
const Main = require('./controller/program.js');

const author = {
  'email': 'test@test.com',
  'password': 'testing'
};

Main.start(author)
.then(() => {
  Main.fetchAllNews();
})
.catch(error => {
console.error(error.message);
});;
