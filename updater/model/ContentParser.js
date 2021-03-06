class ContentParser {
  static removeHtmlFromText(text) {
    let pos = text.search(">");
    if (pos > -1) {
      return text.slice(pos+1);
    }
    return text;
  }
  
  static compareContents(body1, body2) {
    body1 = ContentParser.removeHtmlFromText(body1);
    body2 = ContentParser.removeHtmlFromText(body2);
    let words = body1.split(" ");
    let matches = 0;
    let req = words.length - (words.length / 4);
    for (let item of words) {
      if (matches >= req) {
        return true;
      }
      if (body2.search(item) != -1) {
        ++matches;
      }
    }
    return false;
  }

  static extractWordBasedOnDelimiter(text, delimiter) {
    let newText = text;
    let pos = newText.search(delimiter);
    while (pos != -1) {
      newText = newText.slice(pos+delimiter.length);
      pos = newText.search(delimiter);
    }
    return newText;
  }
}

module.exports = ContentParser;
