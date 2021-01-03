const express = require('express');
const postsRouter = require('./posts.js')
const categoriesRouter = require('./categories.js');
const usersRouter = require('./users.js');
const app = new express();

// INDEX METHODS' ROUTES
app.use('/', postsRouter);

// POSTS METHODS' ROUTES
app.use('/posts', postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/categories', categoriesRouter);

// USERS METHODS' ROUTES
app.use('/users', usersRouter);

app.listen(85);
