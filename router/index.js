const postsRouter = require('./router/posts.js');
const categoriesRouter = require('./router/categories.js');
const usersRouter = require('./router/users.js');
const userRouter = require('./router/user.js');
const commentsRouter = require('./router/comments.js');
const subscriptionRouter = require('./router/subscription.js');

module.exports = {
  postsRouter,
  categoriesRouter,
  usersRouter,
  userRouter,
  commentsRouter,
  subscriptionRouter
};