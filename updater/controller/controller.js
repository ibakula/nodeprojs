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
  
  saveToDB() {
    let data = this.userData;
    data['table'] = 'user';
    this.db.insert(data);
  }
  
  onRefreshStatus(response, resolve, reject) {
    if (!('data' in response)) {
      console.error("Failed to check session status.");
      reject(new Error("Absolutely no data was returned by the server."));
      return;
    }
    if (!('id' in response.data)) {
      console.error("Looks like session has possibly expired.");
      reject(new Error("Session probably expired."))
      return;
    }
    Object.assign(this.userData, response.data);
    this.userData['user_id'] = response.data['id'];
    delete this.userData.id;
    saveToDB();
    resolve();
  }
  
  onUserLogin(response, resolve, reject) {
    if ('data' in response && 'result' in response.data) {
      if (response.data.result.search('Success!') != -1) {
        let endPos = response.headers['Set-Cookie'].search(";");
        this.userData['cookie_id'] = response.headers['Set-Cookie'].slice(response.headers['Set-Cookie'].search("api=")+4, endPos != -1 ? endPos : (response.headers['Set-Cookie'].length - 1));
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
        reject(new Error(response.data.reason));
      }
    }
    else {
      console.error("Could not contact API for log-in.");
      reject(new Error('No proper response was received from the server.'));
    }
  }
  
  updateHeaderConf() {
    this.httpConf.headers = {
      'Set-Cookie': `api=${this.userData.cookie_id};`
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
        if (!('cookie_id' in this.userData)) {
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
