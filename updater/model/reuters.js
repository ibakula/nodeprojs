const Model = require('./model.js');

class ReutersLatestSectionModel extends Model {
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
  
  static extractTime(time) {
    let pos = time.search(":");
    if (pos == -1) {
      continue;
    }
    let minutes = time[pos+1] + time[pos+2];
    minutes = parseInt(minutes);
    let hours = parseInt(time[pos-1]);
    return { hours, minutes };
  }
  
  *newsAddressListTodayIterator() {
    let latest = this.dom.window.document.body.querySelectorAll("#content div:nth-last-child(2) section.module-content article");
    let now = new Date(Date.now());
    let date = this.monthNames[now.getMonth()] + " " + now.getDate() + " " +  now.getFullYear();
    for (let i = 0; i < latest.length; ++i) {
      const postIdStr = latest[i].querySelector("a").getAttribute("href");
      if (postIdStr == null) {
        continue;
      }
      const time = latest[i].querySelector("time span").innerHTML;
      if (time == null ||
        isNaN(parseInt(time[0]))) {
        continue;
      }
      if (this.lastPostTime != null && time == this.lastPostTime) {
        break;
      }
      if (i == 0) {
        this.lastPostTime = time;
      }
      yield { postIdStr, time };
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

module.exports = ReutersLatestSectionModel;
