const axios = require('axios');
const controller = new require('./controller/controller.js')();

Promise.all(controller.init());