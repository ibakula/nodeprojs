const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const postsRouter = require('./router/posts.js');
const categoriesRouter = require('./router/categories.js');
const usersRouter = require('./router/users.js');
const app = new express();

app.use(bodyParser.urlencoded({ extended: true }));

// INDEX METHODS' ROUTES
app.use('/', serveStatic('./public', { dotfiles: 'ignore', extensions: ['html', 'htm'] }));

// POSTS METHODS' ROUTES
app.use('/api/posts', postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/api/categories', categoriesRouter);

// USERS METHODS' ROUTES
app.use('/api/users', usersRouter);

app.listen(80);
