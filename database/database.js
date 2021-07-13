const sqlite = require('sqlite3').verbose();
const VError = require('verror');

let dbRef = null;

function openDatabase(filePath) {
  return new Promise((resolve, reject) => {
    dbRef = new sqlite.Database(filePath, err => {
      if (err) {
        let err2 = new VError(err, "Database open request failed");
        reject(err2);
        return;
      }
      resolve({
        close: dbRef.close.bind(dbRef),
        run: dbRef.run.bind(dbRef),
        get: dbRef.get.bind(dbRef),
        all: dbRef.all.bind(dbRef),
        exec: dbRef.exec.bind(dbRef)
      });
    });
  });
}

class Database {
  constructor(filePath = './local.db') {
    this.db = openDatabase(filePath);
  }
  
  async performTask(taskName, sql, ...params) {
    try {
      const resDb = await this.db;
      
      if (!resDb.hasOwnProperty(taskName)) {
        throw new Error(`attempted to execute a nonexistent task "${taskName}"`);
      }
      
      /* 
        this will extract matching args for different tasks like exec
        which would only take an sql statement plus a callback
        thus avoiding any issues with binding "params" in place of callback 
      */
      let call = resDb[taskName];
      for (const arg in arguments) {
        if (arg == 0) {
          continue;
        }
        call = call.bind(null, arguments[arg]);
      }
      
      return new Promise((resolve, reject) => {
        call((err, rows) => {
          if (err) {
            reject(new VError(err, `${taskName} operation has failed to execute`));
            return;
          }
          
          if (!rows && this instanceof Object && 
             (this.hasOwnProperty('lastID') || 
              this.hasOwnProperty('changes'))) {
            resolve(this);
            return;
          }
          
          resolve(rows);
        });
      });
    }
    catch (err) {
      throw new VError(err, `${taskName} operation has failed`);
    }
  }
};

module.exports = Database;