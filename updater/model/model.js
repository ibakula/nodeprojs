const jsdom = require('jsdom');

class Model {
  constructor(html) {
    this.dom = new jsdom.JSDOM(html);
  }
}

module.exports = Model;
