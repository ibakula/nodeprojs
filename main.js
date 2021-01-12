const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const sessionStore = require('connect-sqlite3')(session);
const postsRouter = require('./router/posts.js');
const categoriesRouter = require('./router/categories.js');
const usersRouter = require('./router/users.js');
const userRouter = require('./router/user.js');
const commentsRouter = require('./router/comments.js');
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
app.use('/api/user', userRouter);

// POSTS METHODS' ROUTES
app.use('/api/posts', postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/api/categories', categoriesRouter);

// USERS METHODS' ROUTES
app.use('/api/users', usersRouter);

// COMMENTS METHODS' ROUTES
app.use('/api/comments', commentsRouter);

app.listen(80);
