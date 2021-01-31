const sqlite = require('sqlite3').verbose();

class Database {
  constructor(name) {
    this.isOpen = false;
    this.db = new sqlite.Database(name, this.handleOpenDb);
    this.error = null;
  }
  
  handleOpenDb(error) {
    if (error == null) {
      console.log("Database opened successfully!");
      this.isOpen = true;
    }
    else {
      console.error("DB Error: could not open the database.");
      console.error(error.message);
      this.error = error;
    }
  }
  
  executeDeferredQuery(task, sql) {
    let dbErr = this.error;
    let promise = new Promise((resolve, reject) => {
      if (dbErr != null) {
        reject(dbErr);
      }
      else {
        task(sql, (err, rows) => {
          if (err != null) {
            reject(err);
          }
          else {
            rows != undefined ? resolve(rows) : resolve();
          }
        });
      }
    });
    
    return promise;
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
    sql += `FROM ${table} `;
    if (matches != null && matches != undefined) {
      sql += "WHERE ";
      for (const item in matches) {
        sql += `${item} = '${matches.item}', `;
      }
      sql = sql.slice(0, sql.length-2);
      sql += ";";
    }
    
    return this.executeDeferredQuery(this.db.all, sql);
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
      val += `${params.i}, `;
    }
    sql = sql.slice(0, sql.length-2);
    val = val.slice(0, val.length-2);
    sql += val + ');';
    
    return this.executeDeferredQuery(this.db.run, sql);
  }
  
  // params: Object, matches: Object
  update(params, matches) {
    let sql = `UPDATE ${params.table} SET `;
    for (const i in params) {
      sql += `${i} = '${params.i}', `;
    }
    sql = sql.slice(0, sql.length-2);
    sql += " WHERE ";
    for (const i in matches) {
      sql += `${i} = ${matches.i}, `;
    }
    sql = sql.slice(0, sql.length-2);
    sql += ';';

    return this.executeDeferredQuery(this.db.run, sql);
  }
  
  // params: Object
  remove(params) {
    let sql = `DELETE FROM {params.table}`;
    for (const i in params) {
      sql += ` WHERE ${i} = ${params.i} AND `;
    }
    sql = sql.slice(0, sql.length-5);
    sql += ';';
    
    return this.executeDeferredQuery(this.db.run, sql);
  }
}

module.exports = Database;
