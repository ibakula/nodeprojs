const Database = require('../database/database.js');
const QueryString = require('querystring');

class Controller {
  constructor(databasePath) {
    this.db = new Database(databasePath);
    this.userData = {};
    this.httpConf = { 
      withCredentials: true
    };
  }
  
  onUserLogin(response) {
    
  }
  
  // loginData = { email, password }
  setCookie(loginData) {
    if (!('cookie_id' in this.userData)) {
      axios.post('/api/user/login', QueryString.stringify(loginData))
      .then(onUserLogin)
      .catch(error => {
        console.error("setCookie error: Could not perform user login!");
        console.error(error.message);
      });
    }
    else {
      this.httpConf.headers = {
        'Set-Cookie': `api=${this.userData.cookie_id};`
      };
      // get login status
    }
  }
  
  init() { 
    return this.db.select('*', null, 'user')
    .then(rows => {
      this.userData = rows[0];
    })
    .catch(error => {
      console.error("DB Selection error: Failed to fetch user data");
      console.error(error.message);
    });
  }
}

module.exports = Controller;
