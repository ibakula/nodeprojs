const Model = require('./model.js');

class BbcLatestSectionModel extends Model {
  constructor(html, sectionName) {
    super(html);
    this.timeNames = [ 'd', 'h' ];
    this.monthNames = [ 'Jan', 
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    this.sectionName = sectionName;
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelector("#site-container div:nth-child(3) ol");
    let now = new Date(Date.now());
    for (let i = 0; i < latest.children.length; ++i) {
      if (latest.children[i].tagName == "LI") {
        let postIdStr = latest.children[i].firstElementChild.getElementsByTagName("a")[0].getAttribute("href");
        if (postIdStr != null && postIdStr.search(this.sectionName) > -1) {
          yield postIdStr;
        }
      }
    }
  }
  
  get linksFullArticle() {
    let links = [];
    for (let item of this.newsAddressListTodayIterator()) {
      links.push(item);
    }
    return links;
  }
  
  // params: html code of the article itself
  grabFullArticle(html) {
    const aDom = new jsdom.JSDOM(html);
  }
}

module.exports = BbcLatestSectionModel;
