const axios = require('axios');
const controller = new (require('./controller/controller.js'))('./database/user.db');

controller.init();

