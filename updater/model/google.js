const Model = require('./model.js');

class GoogleNews extends Model {
  constructor(html) {
    super(html);
  }
  
  get newsByCurrentDate() {
    let date = Date.now();
    let articles = [];
    let cwiz = this.dom.window.document.getElementsByTagName("c-wiz")[1];
    let articlesContainer = cwiz.getElementsByTagName("main")[1].firstElementChild;
    for (const item of articlesContainer) {
      
    }

    return firstArticle.firstElementChild.getAttribute("href");
  }
}

module.exports = GoogleNews
