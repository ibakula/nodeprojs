const Model = require('./model.js');

class NytLatestSectionModel extends Model {
  constructor(html) {
    super(html);
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelector("#site-content div.css-psuupz ol");
    let date = Date.now();
    for (let i = 0; i < latest.children.length; ++i) {
      if (latest.children[i].tagName == "LI") {
        yield latest.children[i].firstElementChild.firstElementChild.firstElementChild.getAttribute("href");
      }
    }
  }
  
  get grabLinksToFullArticlesFromLatestSection() {
    let links = [];
    for (let item of this.newsAddressListIterator()) {
      links.push(item);
    }
    return links;
  }
  
  // params: html code of the article itself
  grabFullArticle(html) {
    const aDom = new jsdom.JSDOM(html);
  }
}

module.exports = NytLatestSectionModel;
