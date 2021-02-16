const Model = require('./model.js');

class BbcLatestSectionModel extends Model {
  constructor(html, sectionName, url) {
    super(html, url);
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
    // This member assumes value of the last "inserted" posts time
    this.lastPostTime = null;
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelector("#site-container div:nth-child(3) ol");
    let now = new Date(Date.now());
    let date = now.getDate() + " " +  this.monthNames[now.getMonth()];
    let firstChild = false;
    for (let i = 0; i < latest.children.length; ++i) {
      if (latest.children[i].tagName == "LI") {
        if (firstChild == false) {
          firstChild = i;
        }
        let postIdStr = latest.children[i].firstElementChild.getElementsByTagName("a")[0].getAttribute("href");
        if (postIdStr != null /*&& postIdStr.search(this.sectionName) > -1*/) {
          let time = latest.children[i].querySelector("time span:last-child").innerHTML;
          if (this.lastPostTime != null && this.lastPostTime == time ||
            (time.length > 5 && time.search(date) == -1)) {
            this.lastPostTime = latest.children[firstChild].querySelector("time span:last-child").innerHTML;
            break;
          }
          if (this.lastPostTime == null ||
              i == (latest.children.length-1)) {
            this.lastPostTime = latest.children[firstChild].querySelector("time span:last-child").innerHTML;
          }
          yield { postIdStr, time };
        }
      }
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
