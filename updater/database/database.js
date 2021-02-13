const sqlite = require('sqlite3').verbose();

function databaseTemplateFn() {
  let db = null;
  let isOpen = false;
  let error = null;

  // End result: resolve(), reject(error)
  function handleOpen(err, resolve, reject) {
    if (error == null) {
      console.log("Database opened successfully!");
      isOpen = true;
      error != null ? error = null : 0; // Reset in case reopen occurs
      resolve();
    }
    else {
      console.error("DB Error: could not open the database.");
      console.error(error.message);
      err = error; // "write down" the error
      isOpen ? isOpen = false : 0;
      reject(err);
    }
  }

  return {
    open(dbPath) {
      return new Promise((resolve, reject) => {
        db = new sqlite.Database(dbPath, error => {
          handleOpen(error, resolve, reject);
        });
      });
    },
    get isOpen() {
      return isOpen;
    },
    get error() {
      return error;
    },
    perform(task, sql, next) {
      db[task](sql, (err, rows) => {
        if (err != null) {
          error = err;
          next(err);
        }
        else {
          next(null, rows);
        }
      });
    }
  };
}

class Database {
  constructor() {
    this.db = databaseTemplateFn();
  }

  executeDeferredQuery(task, sql) {
    return new Promise((resolve, reject) => {
      if (this.db.error != null) {
        reject(dbErr);
      }
      else {
        this.db.perform(task, sql, (err, rows) => {
          if (err != null) {
            reject(err);
          }
          else {
            rows != undefined ? resolve(rows) : resolve(); // some operations like insert, dont expect to return data
          }
        });
      }
    });
  }

  // params: Array, matches: Object, table: String
  select(params, matches, table) {
    let sql = "SELECT ";
    if (Array.isArray(params)) {
      for (const i of params) {
        sql += `${i} ,`;
      }
      sql = sql.slice(0, sql.length-1);
    }
    else {
      sql += '* ';
    }
    sql += `FROM ${table}`;
    if (matches != null && matches != undefined) {
      sql += " WHERE ";
      for (const item in matches) {
        sql += `${item} = `+ "'" + `${matches[item]}` + "' AND ";
      }
      sql = sql.slice(0, sql.length-4);
    }
    sql += ";";
    
    return this.executeDeferredQuery('all', sql);
  }
  
  // params: Object
  insert(params) {
    let sql = `INSERT INTO ${params.table} (`;
    let val = "VALUES (";
    for (const i in params) {
      if (i == 'table') {
        continue;
      }
      sql += `${i}, `;
      val += "'" + params[i] + "', ";
    }
    sql = sql.slice(0, sql.length-2);
    sql += ") ";
    val = val.slice(0, val.length-2);
    sql += val + ');';

    return this.executeDeferredQuery('run', sql);
  }
  
  // params: Object, matches: Object
  update(params, matches) {
    let sql = `UPDATE ${params.table} SET `;
    for (const i in params) {
      sql += `${i} = ` + "'" + params[i] + "', ";
    }
    sql = sql.slice(0, sql.length-2);
    sql += " WHERE ";
    for (const i in matches) {
      sql += `${i} = ${matches.i} AND `;
    }
    sql = sql.slice(0, sql.length-5);
    sql += ';';

    return this.executeDeferredQuery('run', sql);
  }
  
  // params: Object
  remove(params) {
    let sql = `DELETE FROM ${params.table}`;
    for (const i in params) {
      sql += ` WHERE ${i} = ${params.i} AND `;
    }
    sql = sql.slice(0, sql.length-5);
    sql += ';';
    
    return this.executeDeferredQuery('run', sql);
  }
  
  open(databasePath) {
    return this.db.open(databasePath);
  }
}

module.exports = Database;
