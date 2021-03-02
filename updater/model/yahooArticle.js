const Model = require('./model.js');
const contentParser = require('./ContentParser.js');

class BbcArticleModel extends Model {
  constructor(html, url) {
    super(html, url);
    this.monthNames = [ 'January', 
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
  }
  
  get articleData() {
    const article = this.dom.window.document.body
    .querySelector("#caas-content-body article div.caas-body-wrapper > div.caas-body-content .caas-body-section div.caas-content-wrapper div.caas-body");
    if (article == null) {
      return { 'title': '', 'text': '' };
    }
    let title = this.dom.window.document.body.querySelector("#caas-content-body article header h1");
    if (title == null) {
    console.log("HERE2");
      return { 'title': '', 'text': '' };
    }
    title = title.innerHTML;
    if (title.length == 0) {
    console.log("HERE3");
      return { 'title': '', 'text': '' };
    }
    let time = article.parentElement.firstElementChild.querySelector("time");
    if (time == null) {
    console.log("HERE4");
      return { 'title': '', 'text': '' };
    }
    time = time.innerHTML;
    if (time.length == 0) {
      return { 'title': '', 'text': '' };
    }
    const now = new Date(Date.now());
    const date = this.monthNames[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
    if (time.search(date) == -1) {
      return { 'title': '', 'text': '' };
    }

    let text = "";
    if (article.firstElementChild.tagName == "FIGURE") {
      const img = article.firstElementChild.querySelector("img");
      if (img != null) {
        text += '<img width="430px" height="300px" src="' + img.getAttribute("src") + '" />';
      }
    }

    for (let i = 0; i < article.children.length; ++i) {
      if (article.children[i].tagName != "P") {
        continue;
      }
      const element = article.children[i];
      for (let i = 0; i < element.children.length; ++i) {
        if (!element.children[i].hasAttributes()) {
          continue;
        }
        for (let u = element.children[i].attributes.length-1; u > -1; --u) {
          element.children[i].removeAttributeNode(element.children[i].attributes.item(u));
        }
      }
      text += element.innerHTML + '<br /><br />';
    }
    text = text.trim();
    text = text.slice(0, text.length-12);
    
    return { 'title': title, 'text': text };
  }
}

module.exports = BbcArticleModel;
