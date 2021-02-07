const axios = require('axios');
const Database = require('./database/database.js');
const db = new Database('./database/user.db');

let userData = {};

db.select('*', null, 'user')
.then(rows => {
  userData = rows[0];
})
.catch(error => {
  console.error("DB Selection error: Failed to fetch user data");
  console.error(error.message);
});
