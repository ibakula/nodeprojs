const Model = require('./model.js');

class BbcLatestSectionModel extends Model {
  constructor(html, sectionName, url) {
    super(html, url);
    this.sectionName = sectionName;
    // This member assumes value of the last "inserted" posts time
    this.lastPostIdStr = '';
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelector("#Main div:nth-child(2) ul");
    for (let i = 0; i < latest.children.length; ++i) {
      let postIdStr = latest.children[i].querySelector("h3 a");
      if (postIdStr == null) {
        continue;
      }
      postIdStr = postIdStr.getAttribute("href");
      if (postIdStr.search("https:") != -1) {
        continue;
      }
      postIdStr = this.dom.window.location.origin + postIdStr;
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
