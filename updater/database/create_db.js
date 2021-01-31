const sqlite = require('sqlite3').verbose();
const errorHandler = require('../../model/errorHandler');
const db = new sqlite.Database("./user.db", errorHandler.handleDbOpen);

if (db != null) {
  db.run("CREATE TABLE user (cookie_id TEXT PRIMARY KEY, user_id INTEGER DEFAULT '0', permissions INTEGER DEFAULT '0', email TEXT DEFAULT '', first_name TEXT DEFAULT '', last_name TEXT DEFAULT '', last_login TEXT DEFAULT '');");
}
