const sqlite = require('sqlite3').verbose();
const errorHandler = require('../model/errorHandler');
const db = new sqlite.Database("./news.db", errorHandler.handleDbOpen);

if (db != null) {
    db.run("CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL, category_id INTEGER NOT NULL, author_id INTEGER NOT NULL, date TEXT NOT NULL);");
    db.run("CREATE TABLE categories (id INTEGER PRIMARY KEY, title TEXT NOT NULL);");
    db.run("CREATE TABLE users (id INTEGER PRIMATY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, permissions INTEGER DEFAULT 0, signup_date TEXT NOT NULL, login_date TEXT DEFAULT 0);");
}
