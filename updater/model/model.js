const jsdom = require('jsdom');

class Model {
  constructor(html, address) {
    this.dom = new jsdom.JSDOM(html, { url: address, contentType: "text/html" });
  }

  updateDom(html) {
    let address = this.dom.window.origin + this.dom.window.pathname;
    this.dom = new jsdom.JSDOM(html, { url: address, contentType: "text/html" });
  }
}

module.exports = Model;
