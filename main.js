const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const session = require('express-session');
const sessionStore = require('connect-sqlite3')(session);
const postsRouter = require('./router/posts.js');
const categoriesRouter = require('./router/categories.js');
const usersRouter = require('./router/users.js');
const app = new express();

app.use(bodyParser.urlencoded({ extended: true }));

// INDEX METHODS' ROUTES
app.use('/', serveStatic('./public', { 
    dotfiles: 'ignore',
    extensions: ['html', 'htm'] }));

// API ROUTE SESSION CONFIGURATION
app.use('/api', session({ 
    secret: 'dwelltime!toBereckondWith', 
    store: new sessionStore({ db: 'sessions.db', dir: './database' }), 
    resave: true, 
    saveUninitialized: false, 
    cookie: { 
        path: '/', 
        httpOnly: false, 
        secure: false, 
        maxAge: null, 
        sameSite: 'strict', 
        name: 'api'
    }
}));

// POSTS METHODS' ROUTES
app.use('/api/posts', postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/api/categories', categoriesRouter);

// USERS METHODS' ROUTES
app.use('/api/users', usersRouter);

app.listen(80);
