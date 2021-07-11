const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sessionStore = require('connect-sqlite3')(session);
const routes = require('./router/index.js');
const app = new express();

// INDEX METHODS' ROUTES
app.use('/', serveStatic('./public', { 
    dotfiles: 'ignore',
    extensions: ['html', 'htm'] }
));

app.use('/api', bodyParser.urlencoded({ extended: true }));

app.use('/api', cookieParser());

// API ROUTE SESSION CONFIGURATION
app.use('/api', session({
    key: 'sessionId',
    secret: 'dwelltime!toBereckondWith',
    store: new sessionStore({ db: 'sessions.db', dir: './database' }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: '/api',
        httpOnly: false,
        secure: false,
        maxAge: 2592000000, // 30 days
        sameSite: 'strict',
        name: 'api'
    }
}));

// USER METHODS' ROUTES
app.use('/api/user', routes.userRouter);

// POSTS METHODS' ROUTES
app.use('/api/posts', routes.postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/api/categories', routes.categoriesRouter);

// USERS METHODS' ROUTES
app.use('/api/users', routes.usersRouter);

// COMMENTS METHODS' ROUTES
app.use('/api/comments', routes.commentsRouter);

// SUBSCRIPTION ROUTES
app.use('/api/subscription', routes.subscriptionRouter);

app.use('/api', routes.errorHandler);

app.listen(80);
