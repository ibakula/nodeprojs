const Model = require('./model.js');
const contentParser = require('./ContentParser.js');

class BbcArticleModel extends Model {
  constructor(html, url) {
    super(html, url);
  }
  
  get articleData() {
    const article = this.dom.window.document.body
    .querySelector("#main-content:nth-last-child(2) article");
    let text = "";
    for (let item of article.children) {
      if (!(item.tagName == "DIV" &&
        (item.getAttribute("data-component") == "text-block" ||
         item.getAttribute("data-component") == "image-block") || 
         item.getAttribute("data-component") == "crosshead-block")) {
        continue;
      } 
      if (item.innerHTML.search("<a") != -1) {
        continue;
      }
      for (let element of item.children) {
        element.removeAttribute("class");
      }
      if (item.getAttribute("data-component") == "image-block") {
        const element = item.querySelector("img");
        if (element != null) {
          element.removeAttribute("srcset");
          element.removeAttribute("loading");
          element.removeAttribute("class");
          text += element.outerHTML + "<br />";
        }
      }
      else if (item.getAttribute("data-component") == "crosshead-block") {
        const element = item.querySelector("h2");
        if (element != null) {
          element.removeAttribute("class");
          text += element.outerHTML + "<br />";
        }
      }
      else {
        const element = item.querySelector("p");
        if (element != null) {
          text += element.innerHTML + "<br />";
        }
      }
    }
    return text;
  }
}

module.exports = BbcArticleModel;
