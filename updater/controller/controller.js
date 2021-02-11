const Database = require('../database/database.js');
const QueryString = require('querystring');

class Controller {
  constructor(databasePath) {
    this.db = new Database();
    this.userData = {};
    this.httpConf = { 
      withCredentials: true
    };
  }
  
  onRefreshStatus(response, resolve, reject) {
    // Populate userData
    // save to DB
  }
  
  onUserLogin(response, resolve, reject) {
    if ('data' in response && 'result' in response.data) {
      if (response.data.result.search('Success!') != -1) {
        this.userData['cookie_id'] = response.headers['Set-Cookie'];
        this.updateHeaderConf();
        axios.get('/api/user/status', { headers: this.httpConf.headers })
        .then(response => {
          this.onRefreshStatus(response, resolve, reject);
        })
        .catch(error => {
          console.error("User status could not be obtained.");
          console.error(error.message);
          reject(error);
        });
      }
      else { // else 'Failed!' with a property 'reason'
        console.error("Login failed!");
        console.error(response.data.reason);
        reject(error);
      }
    }
    else {
      reject(new Error('No proper response was received from the server.'));
    }
  }
  
  updateHeaderConf() {
    this.httpConf.headers = {
      'Set-Cookie': `${this.userData.cookie_id};`
    };
  }
  
  // loginData = { email, password }
  setCookie(loginData) {
    return new Promise((resolve, reject) => {
      if (!('cookie_id' in this.userData)) {
        axios.post('/api/user/login', QueryString.stringify(loginData))
        .then(response => { 
          this.onUserLogin(response, resolve, reject);
        })
        .catch(error => {
          console.error("setCookie error: Could not perform user login!");
          console.error(error.message);
          reject(error);
        });
      }
      else {
        this.updateHeaderConf();
        // get login status
      }
    });
  }
  
  init(dbFilePath) {
    return new Promise((resolve, reject) => {
      this.db.open(dbFilePath)
      .then(() => {
        this.db.select('*', null, 'user')
        .then(rows => {
          this.userData = rows[0];
          resolve();
        })
        .catch(error => {
          console.error("DB Selection error: Failed to fetch user data");
          console.error(error.message);
          reject();
        })
      })
    });
  }
}

module.exports = Controller;
