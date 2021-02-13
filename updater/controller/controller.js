const Database = require('../database/database.js');
const QueryString = require('querystring');
const axios = require('axios');

class Controller {
  constructor() {
    this.db = new Database();
    this.userData = { };
  }
  
  deleteFromDB() {
    let data = { 
      'cookie_id': this.userData['cookie_id'], 
      'table': 'user' 
    }
    this.db.remove(data);
  }
  
  saveToDB() {
    let data = this.userData;
    data['table'] = 'user';
    this.db.insert(data);
  }
  
  onRefreshStatus(response, resolve, reject) {
    if (!('data' in response)) {
      reject(new Error("Absolutely no data was returned by the server."));
      return;
    }
    if (!('id' in response.data)) {
      this.deleteFromDB();
      this.userData = { };
      reject(new Error("Session probably expired."))
      return;
    }
    if (!('user_id' in this.userData)) {
      Object.assign(this.userData, response.data);
      this.userData['user_id'] = response.data['id'];
      delete this.userData.id;
      this.saveToDB();
    }
    resolve();
  }
  
  onUserLogin(response, resolve, reject) {
    if ('data' in response && 'result' in response.data) {
      if (response.data.result.search('Success!') != -1) {
        let cookie = response.headers['set-cookie'][0];
        let endPos = cookie.search(";");
        this.userData['cookie_id'] = cookie.slice(cookie.search("sessionId=")+10, endPos != -1 ? endPos : (cookie.length-1));
        this.updateHeaderConf();
        axios.get('/api/user/status')
        .then(response => {
          this.onRefreshStatus(response, resolve, reject);
        })
        .catch(error => {
          reject(error);
        });
      }
      else { // else 'Failed!' with a property 'reason'
        reject(new Error(response.data.reason));
      }
    }
    else {
      reject(new Error('No proper response was received from the server.'));
    }
  }
  
  updateHeaderConf() {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.get['Cookie'] = `sessionId=${this.userData.cookie_id};`;
    axios.defaults.headers.post['Cookie'] = `sessionId=${this.userData.cookie_id};`;
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
          reject(error);
        });
      }
      else {
        this.updateHeaderConf();
        axios.get('/api/user/status')
        .then(response => {
          this.onRefreshStatus(response, resolve, reject);
        })
        .catch(error => {
          reject(error);
        });
      }
    });
  }
  
  init(dbFilePath) {
    return new Promise((resolve, reject) => {
      this.db.open(dbFilePath)
      .then(() => {
        this.db.select('*', null, 'user')
        .then(rows => {
          if (rows.length > 0) {
            this.userData = rows[0];
          }
          resolve();
        })
        .catch(error => {
          reject();
        })
      })
    });
  }
}

module.exports = Controller;
