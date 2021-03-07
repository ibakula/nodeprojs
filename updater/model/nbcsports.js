const Model = require('./model.js');

class BbcLatestSectionModel extends Model {
  constructor(html, sectionName, url) {
    super(html, url);
    this.sectionName = sectionName;
    // This member assumes value of the last "inserted" posts time
    this.lastPostIdStr = '';
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelector("#nbcsports-main div.content div div div div:nth-child(2) div");
    for (let i = 0; i < latest.children.length; ++i) {
      if (latest.children[i].querySelector(".play-btn") != null) {
        continue;
      }
      const postIdStr = latest.children[i].querySelector("a").getAttribute("href");
      if (postIdStr == null) {
        continue;
      }
      if (this.lastPostIdStr.length > 0 && this.lastPostIdStr == postIdStr) {
        break;
      }
      if (i == 0) {
        this.lastPostIdStr = postIdStr;
      }
      yield { postIdStr, time: '' };
    }
  }
  
  get linksToFullArticle() {
    let links = [];
    for (let item of this.newsAddressListTodayIterator()) {
      links.push(item);
    }
    return links;
  }
}

module.exports = BbcLatestSectionModel;
