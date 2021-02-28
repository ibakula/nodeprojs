const Model = require('./model.js');
const contentParser = require('./ContentParser.js');

class ReutersArticleModel extends Model {
  constructor(html, url) {
    super(html, url);
  }
  
  get articleData() {
    let article = this.dom.window.document.body
    .querySelector("div article div");
    let text = "";
    for (let i = 1; i < (article.children.length-2); ++i) {
      if (article.children[i].tagName != "P") {
        continue;
      }
      const element = article.children[i];
      const pos = element.innerHTML.search(/reuters/i);
      if (pos != -1) {
        element.innerHTML = element.innerHTML.slice(0, pos) + element.innerHTML.slice(pos+7);
      }
      for (let i = 0; i < element.children.length; ++i) {
        if (!element.children[i].hasAttributes()) {
          continue;
        }
        for (let i = element.children[i].attributes.length-1; i > -1; --i) {
          element.children[i].removeAttributeNode(element.children[i].attributes.item(i));
        }
      }
      text += element.innerHTML + "<br /><br />";
    }    
    text = text.trim();
    text = text.slice(0, text.length-12);
    
    return { 'title': this.dom.window.document.body.querySelector("div h1").innerHTML, 'text': text };
  }
}

module.exports = ReutersArticleModel;
