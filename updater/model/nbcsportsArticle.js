const Model = require('./model.js');
const contentParser = require('./ContentParser.js');

class BbcArticleModel extends Model {
  constructor(html, url) {
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
  }
  
  get articleData() {
    const article = this.dom.window.document.body
    .querySelector("#nbcsports-content-wrapper #content main article > div");
    let title = article.parentElement.firstElementChild.firstElementChild;
    if (title == null) {
      return { 'title': '', 'text': '' };
    }
    title = title.innerHTML;
    if (title.length == 0) {
      return { 'title': '', 'text': '' };
    }
    let time = article.parentElement.firstElementChild.querySelector("a .entry-date");
    if (time == null) {
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
    for (let i = 0; i < article.children.length; ++i) {
      if (article.children[i].tagName != "P") {
        continue;
      }
      const element = article.children[i];
      const pos = element.innerHTML.search(/nbc/i);
      if (pos != -1) {
        element.innerHTML = element.innerHTML.slice(0, pos) +  element.innerHTML.slice(pos+3);
      }
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
