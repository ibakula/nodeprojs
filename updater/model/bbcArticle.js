const Model = require('./model.js');
const contentParser = require('./ContentParser.js');

class BbcArticleModel extends Model {
  constructor(html, url) {
    super(html, url);
  }
  
  get articleData() {
    let article = this.dom.window.document.body
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
          if (element.getAttribute("alt").search(/bbc/i) != -1 ||
            element.getAttribute("alt").search(/read more/i) != -1 ||
            element.getAttribute("alt").search(/interested/i) != -1 ) {
            break;
          }
          element.removeAttribute("srcset");
          element.removeAttribute("loading");
          element.removeAttribute("class");
          element.setAttribute("width", "430px");
          element.setAttribute("height", "300px");
          text += element.outerHTML + "<br />";
        }
      }
      else if (item.getAttribute("data-component") == "crosshead-block") {
        const element = item.querySelector("h2");
        if (element != null) {
          if (element.innerHTML.search(/interested/i) != -1 || 
            element.innerHTML.search(/read more/i) != -1 ||
            element.innerHTML.search(/bbc/i) != -1) {
            break;
          }
          element.removeAttribute("class");
          text += element.outerHTML + "<br />";
        }
      }
      else {
        const element = item.querySelector("p");
        if (element != null) {
          if (element.innerHTML.search(/bbc/i) != -1 || 
            element.innerHTML.search(/BBC/i) != -1) {
            continue;
          }
          text += element.innerHTML + "<br /><br />";
        }
      }
    }
    text = text.trim();
    
    return { 'title': article.querySelector("#main-heading").innerHTML, 'text': text };
  }
}

module.exports = BbcArticleModel;
