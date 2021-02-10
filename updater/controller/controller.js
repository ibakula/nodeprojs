const Database = require('./database/database.js');
const db = new Database('./database/user.db');

class Controller {
  constructor(path) {
    this.db = new Database('./database/user.db');
    this.userData = {};
    this.httpConf = { 
      withCredentials: true; 
    };
  }
  
  handleMethodError(error) {
    console.error(`HTTP Request error has occured: ${error.message}`);
  }
  
  getCookie(response) {
    
  }
  
  setCookie() {
    if(!('cookie_id' in userData)) {
      axios.get('/api')
      .then(this.getCookie)
      .catch(error => {
        
      });
    }
    else {
      this.httpConf.headers = {
        'Set-Cookie': `api=${this.userData.cookie_id};`
      };
    }
  }
  
  init() { 
    return Promise.all(db.select('*', null, 'user')
    .then(rows => {
      this.userData = rows[0];
    })
    .catch(error => {
      console.error("DB Selection error: Failed to fetch user data");
      console.error(error.message);
    }));
  }
}

module.exports = Controller;