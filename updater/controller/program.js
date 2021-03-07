const controller = new (require('./controller.js'))();
const contentParser = require('../model/ContentParser.js');

class Main {
  static extractLinks(response) {
    let sectionName = contentParser.extractWordBasedOnDelimiter(response.config.url, "/");
    return controller.getLatestNews(response.data, sectionName, response.config.url);
  }

  static insertArticle(textObj, categoryId) {
    return controller.cloneArticle(textObj, categoryId);
  }

  static searchForArticle(textObj) {
    return controller.searchArticle(textObj);
  }

  static getArticle(link) {
    return controller.readArticle(link);
  }

  static fetchNewsData(link) {
    return controller.getNews(link);
  }

  static start(authorData) {
    return new Promise((resolve, reject) => {
      let init = Promise.resolve(controller.init('./database/user.db'))
      .then(() => {
        console.log("App initialized!");
      })
      .catch(err => {
        console.error("App failed to start!");
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
