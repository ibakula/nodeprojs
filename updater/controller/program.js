const controller = new (require('./controller.js'))();

class Main {
  static fetchNewsData(link) {
    return new Promise((resolve, reject) => { 
      controller.getNews(link)
      .then(response => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
    });
  }

  static start(authorData) {
    return new Promise((resolve, reject) => {
      let init = Promise.resolve(controller.init('./database/user.db'))
      .then(() => {
        console.log("App initialized!");
      })
      .catch(err => {
        console.error("App failed to start!");
        error != null ? console.error(error.message) : false;
        reject(err);
      });
      
      let setCookie = Promise.resolve(init).then(() => {
        controller.setCookie(authorData)
        .then(() => {
          console.log("User cookie was successfully set!");
          resolve();
        })
        .catch(error => {
          console.error("Could not create/update cookie data!");
          error != null ? console.error(error.message) : false;
          if (error.message.search("expired") != -1) {
            console.log("Session cookie has expired and was reset by the server.");
            console.log("Resetting session cookie and attempting to create a new one!");
            Promise.resolve(controller.deleteFromDB())
            .then(() => {
              console.log("Session cookie was wiped.");
              controller.setCookie(authorData)
              .then(() => {
                console.log("User cookie was successfully set!");
                resolve();
              });
            })
            .catch(() => {
              console.error("Could not delete user data.");
              reject(new Error("Cookie deletion has failed!"));
            });
          }
          else {
            reject(error);
          }
        });
      });
    });
  }
}

module.exports = Main;
