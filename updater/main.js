const axios = require('axios');
const controller = new (require('./controller/controller.js'))('./database/user.db');

Promise.resolve(controller.init('./database/user.db'))
.then(v => {
  console.log("App initialized!");
})
.catch(error => {
  console.error("App failed to start 2!");
  error != null ? console.error(error.message) : false;
});;

