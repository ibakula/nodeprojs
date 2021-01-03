const sqlite = require('sqlite3').verbose();
const errorHandler = require('./errorHandler');
const db = new sqlite.Database("newsdb", errorHandler.handleDbOpen);

module.exports = db;