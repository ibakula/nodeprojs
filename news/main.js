const express = require('express');
const bodyParser = require('body-parser');
const postsRouter = require('./router/posts.js');
const categoriesRouter = require('./router/categories.js');
const usersRouter = require('./router/users.js');
const app = new express();

app.use(bodyParser.urlencoded({ extended: true }));

// INDEX METHODS' ROUTES
//app.use('/', postsRouter);

// POSTS METHODS' ROUTES
app.use('/posts', postsRouter);

// CATEGORIES METHODS' ROUTES
app.use('/categories', categoriesRouter);

// USERS METHODS' ROUTES
app.use('/users', usersRouter);

app.listen(85);
