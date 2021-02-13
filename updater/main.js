const axios = require('axios');
const controller = new (require('./controller/controller.js'))('./database/user.db');

const authorData = {
  'email': 'test@test.com',
  'password' : 'testing'
};

Promise.resolve(controller.init('./database/user.db'))
.then(() => {
  console.log("App initialized!");
})
.catch(error => {
  console.error("App failed to start!");
  error != null ? console.error(error.message) : false;
})
.then(() => {
  controller.setCookie(authorData)
  .then(() => {
    console.log("User cookie was successfully set!");
    console.log(controller.userData);
  })
  .catch(error => {
    console.error("Could not create/update cookie data!");
    error != null ? console.error(error.message) : false;
    console.log(controller);
  });
});
