const sqlite = require('sqlite3').verbose();
const errorHandler = require('../model/errorHandler');
const db = new sqlite.Database("./news.db", errorHandler.handleDbOpen);

if (db != null) {
    db.run("CREATE TABLE posts (id INTEGER NOT NULL PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL, category_id INTEGER NOT NULL, author_id INTEGER NOT NULL, views INTEGER DEFAULT 0, date TEXT NOT NULL);");
    db.run("CREATE TABLE categories (id INTEGER NOT NULL PRIMARY KEY, title TEXT NOT NULL);");
    db.run("CREATE TABLE users (id INTEGER NOT NULL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, permissions INTEGER DEFAULT 0, signup_date TEXT NOT NULL, login_date TEXT DEFAULT 0);");
    db.run("CREATE TABLE comments (id INTEGER NOT NULL PRIMARY KEY, post_id INTEGER NOT NULL, text TEXT NOT NULL, date TEXT NOT NULL, last_edit TEXT DEFAULT '');");
    //db.run("INSERT INTO users (first_name, last_name, password, email, permissions, signup_date, login_date) VALUES ('test', 'test', 'testing', 'test3@test.com', '0', 'test', 'test');");
}
