const sqlite = require('sqlite3').verbose();
const VError = require('verror');

let db = null;

function openDatabase(filePath) {
  return new Promise((resolve, reject) => {
    db = new sqlite.Database(filePath, err => {
      if (err) {
        let err2 = new VError(err, "Database open request failed");
        reject(err);
        return;
      }
      resolve({
        close: db.close,
        run: db.run,
        get: db.get,
        all: db.all,
        exec: db.exec
      });
    });
  };
}

class Database {
  constructor(filePath = './local.db') {
    this.db = openDatabase(filePath);
  }
  
  async performTask(taskName, sql, ...params) {
    try {
      await this.db;
      
      if (!(taskName in this.db)) {
        throw new Error("attempted to execute a nonexistent task");
      }
      
      /* 
        this will extract matching args for different tasks like exec
        which would only take an sql statement plus a callback
        thus avoiding any issues with binding "params" in place of callback 
      */
      let call = this.db[taskName];
      call.bind(this.db);
      arguments.forEach(arg => {
        if (arg) {
          call = call.bind(arg);
        }
      });
      
      return new Promise((resolve, reject) => {
        call((err, rows) => {
          if (err) {
            reject(new VError(err, `${taskName} operation has failed to execute`));
            return;
          }
            resolve(rows);
        });
      });
    }
    catch (err) {
      throw new VError(err, "run operation has failed");
    }
  }
};

module.exports = Database;