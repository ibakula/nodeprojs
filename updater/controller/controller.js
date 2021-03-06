const Database = require('../database/database.js');
const bbcLatest = require('../model/bbc.js');
const bbcArticle = require('../model/bbcArticle.js');
const nbcLatest = require('../model/nbcsports.js');
const nbcArticle = require('../model/nbcsportsArticle.js');
const reutersLatest = require('../model/reuters.js');
const reutersArticle = require('../model/reutersArticle.js');
const yahooLatest = require('../model/yahoo.js');
const yahooArticle = require('../model/yahooArticle.js');
const contentParser = require('../model/ContentParser.js');
const QueryString = require('querystring');
const axios = require('axios');

class Controller {
  constructor() {
    this.db = new Database();
    this.userData = { };
    this.sectionModels = [];
  }

  cloneArticle(textObj, categoryId) {
    if (textObj == null || 
      textObj.title.length < 3 || 
      textObj.text.length < 3) {
      return Promise.reject(new Error('Text error: text content invalid.'));
    }
    return axios.post('/api/posts', QueryString.stringify({'title': textObj.title,
      'text': textObj.text,
      'categoryId' : categoryId}));
  }

  searchArticle(textObj) {
    return Promise.resolve(axios.post('/api/posts/search', 
     QueryString.stringify({ 'term' : textObj.title })))
     .then(response => {
       return ({ res: response, contentObj: textObj });
     },
     error => { 
       throw error; 
     });
  }
  
  readArticle(link) {
    return new Promise((resolve, reject) => { 
      axios.get(link)
      .then(response => {
        let model = null;
        if (response.config.url.search("bbc") != -1) {
          model = new bbcArticle(response.data, link);
          resolve(model.articleData);
        }
        else if (response.config.url.search("yahoo") != -1) {
          model = new yahooArticle(response.data, link);
          resolve(model.articleData);
        }
        else if (response.config.url.search("nbcsports") != -1) {
          model = new nbcArticle(response.data, link);
          resolve(model.articleData);
        }
        else if (response.config.url.search("reuters") != -1) {
          model = new reutersArticle(response.data, link);
          resolve(model.articleData);
        }
        else {
          reject(new Error(`Could not create an article model from: ${response.config.url}`));
        }
      })
      .catch(error => {
        reject(error);
      });
    });
  }

  findModel(html, sectionName, url) {
    if (this.sectionModels.length > 1) {
      for (let item of this.sectionModels) {
        let address = item.dom.window.location.origin + item.dom.window.location.pathname;
        if (address == url) {
          item.updateDom(html);
          return item;
        }
      }
    }
    let model = null;
    if (url.search("bbc") != -1) {
      model = new bbcLatest(html, sectionName, url);
    }
    else if (url.search("yahoo") != -1) {
      model = new yahooLatest(html, sectionName, url);
    }
    else if (url.search("nbcsports") != -1) {
      model = new nbcLatest(html, sectionName, url);
    }
    else if (url.search("reuters") != -1) {
      model = new reutersLatest(html, sectionName, url);
    }
    this.sectionModels.push(model);
    return model;
  }
  
  getLatestNews(html, sectionName, url) {
    let links = null;
    let model = this.findModel(html, sectionName, url);
    //if (url.search("bbc") != -1) {
      links = model.linksToFullArticle;
    //}
    return links;
  }
  
  getNews(link) {
    return axios.get(link);
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
