const sqlite = require('sqlite3').verbose();
const errorHandler = require('../model/errorHandler');
const db = new sqlite.Database("./news.db", errorHandler.handleDbOpen);

if (db != null) {
    //db.run("CREATE TABLE posts (id INTEGER NOT NULL PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL, category_id INTEGER NOT NULL, author_id INTEGER NOT NULL, views INTEGER DEFAULT 0, date TEXT NOT NULL);");
    //db.run("CREATE TABLE categories (id INTEGER NOT NULL PRIMARY KEY, title TEXT NOT NULL, img TEXT DEFAULT '');");
    //db.run("CREATE TABLE users (id INTEGER NOT NULL PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, password TEXT NOT NULL, email TEXT NOT NULL UNIQUE, permissions INTEGER DEFAULT 0, signup_date TEXT NOT NULL, login_date TEXT DEFAULT '');");
    //db.run("CREATE TABLE comments (id INTEGER NOT NULL PRIMARY KEY, post_id INTEGER NOT NULL, user_id INTEGER NOT NULL, text TEXT NOT NULL, date TEXT NOT NULL, last_edit TEXT DEFAULT '');");
    db.run("CREATE TABLE subscribers (id INTEGER NOT NULL PRIMARY KEY, email TEXT NOT NULL);");
    //db.run("INSERT INTO users (first_name, last_name, password, email, permissions, signup_date) VALUES ('John', 'Doe', 'testing', 'test@test.com', '0', '1610749084810');");
    //db.run("INSERT INTO users (first_name, last_name, password, email, permissions, signup_date) VALUES ('Max', 'Mustermann', 'testing', 'admin@test.com', '3', '1610749084810');");
    //db.run("INSERT INTO categories (title, img) VALUES ('Business and finance', 'https://cdn.pixabay.com/photo/2017/12/17/14/12/bitcoin-3024279_960_720.jpg');");
    //db.run("INSERT INTO categories (title, img) VALUES ('Politics', 'https://cdn.pixabay.com/photo/2017/08/16/04/52/map-of-europe-2646492_960_720.jpg');");
    //db.run("INSERT INTO categories (title, img) VALUES ('Sports', 'https://cdn.pixabay.com/photo/2017/05/31/15/33/gareth-bale-2360754_960_720.jpg');");
    //db.run("INSERT INTO categories (title, img) VALUES ('Technology', 'https://cdn.pixabay.com/photo/2017/08/01/23/23/smartphone-2568602_960_720.jpg');");
    //db.run("INSERT INTO categories (title, img) VALUES ('News from regions all around world', 'https://cdn.pixabay.com/photo/2015/09/21/13/17/road-949832_960_720.jpg');");
    //db.run("INSERT INTO categories (title, img) VALUES ('Science and education', 'https://cdn.pixabay.com/photo/2018/05/03/11/38/skills-3371153_960_720.jpg');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some business topic', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '1', '2', '1610749084810');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some politics-related topic', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '2', '2', '1610749084810');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some sports-related topic', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '3', '2', '1610749084810');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some tech-related topic', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '4', '2', '1610749084810');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some news from a specific region', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '5', '2', '1610749084810');");
    //db.run("INSERT INTO posts (title, text, category_id, author_id, date) VALUES ('Some science breaktrough topic', 'Some less lengthy text just to test out the length and all the other issues that might occur inside the article paragraph.', '6', '2', '1610749084810');");
}
